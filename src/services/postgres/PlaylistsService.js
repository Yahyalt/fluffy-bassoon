const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBToModel } = require('../../utils/utils_playlist');

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylist({
    name, owner,
  }) {
    const id = nanoid(16);
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

  //   async getAlbumById(id) {
  //     const query = {
  //       text: 'SELECT * FROM albums WHERE id = $1',
  //       values: [id],
  //     };
  //     const result = await this._pool.query(query);

  //     if (!result.rows.length) {
  //       throw new NotFoundError('Album tidak ditemukan');
  //     }

  //     return result.rows.map(mapDBToModel)[0];
  //   }

  //   async editAlbumById(id, { name, year }) {
  //     const updatedAt = new Date().toISOString();
  //     const query = {
  //       text: 'UPDATE albums SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id',
  //       values: [name, year, updatedAt, id],
  //     };

  //     const result = await this._pool.query(query);

  //     if (!result.rows.length) {
  //       throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
  //     }
  //   }

  //   async deleteAlbumById(id) {
  //     const query = {
  //       text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
  //       values: [id],
  //     };

  //     const result = await this._pool.query(query);

//     if (!result.rows.length) {
//       throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
//     }
//   }
}

module.exports = PlaylistsService;
