/* eslint-disable no-underscore-dangle */
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const { getPool } = require('../../utils/database');

class CollaborationsService {
  constructor() {
    this._pool = getPool();
  }

  async addCollaboration(playlistId, userId) {
    const id = `collab-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, userId],
    };

    try {
      const result = await this._pool.query(query);
      if (!result.rows.length) {
        throw new InvariantError('Kolaborasi gagal ditambahkan');
      }
      return result.rows[0].id;
    } catch (error) {
      if (error.constraint === 'unique_playlist_id_and_user_id') {
        throw new InvariantError('Kolaborasi sudah ada');
      }
      if (error instanceof InvariantError) {
        throw error;
      }
      throw new InvariantError('Kolaborasi gagal ditambahkan');
    }
  }

  async deleteCollaboration(playlistId, userId) {
    const query = {
      text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
      values: [playlistId, userId],
    };

    try {
      const result = await this._pool.query(query);
      if (!result.rows.length) {
        throw new InvariantError('Kolaborasi gagal dihapus');
      }
    } catch (error) {
      if (error instanceof InvariantError) {
        throw error;
      }
      throw new InvariantError('Kolaborasi gagal dihapus');
    }
  }

  async verifyCollaborator(playlistId, userId) {
    const query = {
      text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId],
    };

    try {
      const result = await this._pool.query(query);
      if (!result.rows.length) {
        throw new InvariantError('Kolaborasi tidak ditemukan');
      }
    } catch (error) {
      if (error instanceof InvariantError) {
        throw error;
      }
      throw new InvariantError('Gagal memverifikasi kolaborator');
    }
  }
}

module.exports = CollaborationsService;