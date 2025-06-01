/* eslint-disable no-underscore-dangle */
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistSongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSongToPlaylist(playlistId, songId) {
    const sQuery = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [songId],
    };

    const sResult = await this._pool.query(sQuery);

    if (!sResult.rows.length) {
      throw new NotFoundError('Lagu gagal ditambahkan');
    }

    const id = `collab-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };
    await this._pool.query(query);
  }

  async deleteSongFromPlaylist(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError('lagu gagal dihapus');
    }
  }

  async getSongsFromPlaylist(playlistId) {
    const query = {
      text: `SELECT songs.* FROM songs
             LEFT JOIN playlist_songs ON songs.id = playlist_songs.song_id
             WHERE playlist_songs.playlist_id = $1`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    return result.rows;
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
               WHERE ps.playlist_id = $1`,
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
      console.error('Error in getPlaylistWithSongs:', error);
      throw error;
    }
  }

  async verifyCollaborator(playlistId, userId) {
    const query = {
      text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError('Kolaborasi tidak ditemukan');
    }
  }
}
module.exports = PlaylistSongsService;
