/* eslint-disable no-underscore-dangle */
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { getPool } = require('../../utils/database');

class PlaylistSongsService {
  constructor(collaborationsService) {
    this._pool = getPool();
    this._collaborationsService = collaborationsService;
  }

  async addSongToPlaylist(playlistId, songId) {
    // Verify song exists
    const sQuery = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [songId],
    };

    try {
      const sResult = await this._pool.query(sQuery);

      if (!sResult.rows.length) {
        throw new NotFoundError('Lagu tidak ditemukan');
      }

      const id = `playlist-song-${nanoid(16)}`;
      const query = {
        text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
        values: [id, playlistId, songId],
      };
      
      const result = await this._pool.query(query);
      if (!result.rows.length) {
        throw new InvariantError('Lagu gagal ditambahkan ke playlist');
      }
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof InvariantError) {
        throw error;
      }
      if (error.constraint === 'unique_playlist_id_and_song_id') {
        throw new InvariantError('Lagu sudah ada dalam playlist');
      }
      throw new InvariantError('Lagu gagal ditambahkan ke playlist');
    }
  }

  async deleteSongFromPlaylist(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    try {
      const result = await this._pool.query(query);
      if (!result.rows.length) {
        throw new InvariantError('Lagu gagal dihapus dari playlist');
      }
    } catch (error) {
      if (error instanceof InvariantError) {
        throw error;
      }
      throw new InvariantError('Lagu gagal dihapus dari playlist');
    }
  }

  async getSongsFromPlaylist(playlistId) {
    const query = {
      text: `SELECT songs.* FROM songs
             LEFT JOIN playlist_songs ON songs.id = playlist_songs.song_id
             WHERE playlist_songs.playlist_id = $1
             ORDER BY songs.title`,
      values: [playlistId],
    };

    try {
      const result = await this._pool.query(query);
      return result.rows;
    } catch (error) {
      throw new InvariantError('Gagal mengambil lagu dari playlist');
    }
  }

  async getPlaylistWithSongs(playlistId) {
    try {
      const playlistQuery = {
        text: `SELECT p.id, p.name, u.username 
               FROM playlists p
               LEFT JOIN users u ON u.id = p.owner
               WHERE p.id = $1`,
        values: [playlistId],
      };

      const songsQuery = {
        text: `SELECT s.id, s.title, s.performer 
               FROM songs s
               INNER JOIN playlist_songs ps ON s.id = ps.song_id
               WHERE ps.playlist_id = $1
               ORDER BY s.title`,
        values: [playlistId],
      };

      const playlistResult = await this._pool.query(playlistQuery);

      if (!playlistResult.rows.length) {
        throw new NotFoundError('Playlist tidak ditemukan');
      }

      const songsResult = await this._pool.query(songsQuery);

      return {
        ...playlistResult.rows[0],
        songs: songsResult.rows,
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new InvariantError('Gagal mengambil data playlist');
    }
  }

  async verifyCollaborator(playlistId, userId) {
    if (this._collaborationsService) {
      await this._collaborationsService.verifyCollaborator(playlistId, userId);
    } else {
      throw new InvariantError('Kolaborasi tidak ditemukan');
    }
  }
}

module.exports = PlaylistSongsService;