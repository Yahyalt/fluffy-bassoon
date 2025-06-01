/* eslint-disable no-underscore-dangle */
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBToModel } = require('../../utils/utils_playlist');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor(playlistSongService) {
    this._pool = new Pool();
    this._playlistSongService = playlistSongService;
  }

  async addPlaylist({
    name, owner,
  }) {
    const id = `playlist-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, name, createdAt, updatedAt, owner],
    };
    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    try {
      const query = {
        text: `SELECT DISTINCT p.id, p.name, u.username 
               FROM playlists p
               LEFT JOIN users u ON u.id = p.owner
               LEFT JOIN collaborations c ON c.playlist_id = p.id
               WHERE p.owner = $1 OR c.user_id = $1`,
        values: [owner],
      };

      const result = await this._pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error in getPlaylists:', error);
      throw error;
    }
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT owner FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('User tidak ditemukan');
    }
    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  // async verifyPlaylistAccess(playlistId, userId) {
  //   try {
  //     // 1. First check if playlist exists
  //     const playlistExists = await this._pool.query({
  //       text: 'SELECT 1 FROM playlists WHERE id = $1',
  //       values: [playlistId],
  //     });

  //     if (!playlistExists.rows.length) {
  //       throw new NotFoundError('Playlist tidak ditemukan'); // 404
  //     }
  //     const query = {
  //       text: `SELECT 1 FROM playlists p
  //              LEFT JOIN collaborations c ON c.playlist_id = p.id
  //              WHERE p.id = $1 AND (p.owner = $2 OR c.user_id = $2)`,
  //       values: [playlistId, userId],
  //     };

  //     const result = await this._pool.query(query);

  //     if (!result.rows.length) {
  //       throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
  //     }
  //   } catch (error) {
  //     console.error('Error in verifyPlaylistAccess:', error);
  //     throw error;
  //   }
  // }

//   async verifyPlaylistAccess(playlistId, userId) {
//   try {
//     console.log('Verifying access for:', { playlistId, userId });

//     // 1. Check if playlist exists
//     const playlistExists = await this._pool.query({
//       text: 'SELECT owner FROM playlists WHERE id = $1',
//       values: [playlistId],
//     });

//     console.log('Playlist query result:', playlistExists.rows);

//     if (!playlistExists.rows.length) {
//       throw new NotFoundError('Playlist tidak ditemukan');
//     }

//     // 2. Check access rights
//     const query = {
//       text: `SELECT p.owner, c.user_id 
//              FROM playlists p
//              LEFT JOIN collaborations c ON c.playlist_id = p.id
//              WHERE p.id = $1 AND (p.owner = $2 OR c.user_id = $2)`,
//       values: [playlistId, userId],
//     };

//     const result = await this._pool.query(query);
//     console.log('Access rights query result:', result.rows);

//     if (!result.rows.length) {
//       throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
//     }
//   } catch (error) {
//     console.error('Error in verifyPlaylistAccess:', error);
//     throw error;
//   }
// }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._playlistSongService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }
}

module.exports = PlaylistsService;
