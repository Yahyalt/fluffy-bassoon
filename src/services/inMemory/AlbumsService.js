const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
// const NotFoundError = require('../../exceptions/NotFoundError');

/* eslint-disable no-underscore-dangle */
class AlbumsService {
  constructor() {
    this._albums = [];
  }

  addAlbum({ name, year }) {
    const id = `album ${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const newAlbum = {
      name, year, id, createdAt, updatedAt,
    };

    this._albums.push(newAlbum);

    const isSuccess = this._albums.filter((album) => album.id === id).length > 0;

    if (!isSuccess) {
      throw new InvariantError('Catatan gagal ditambahkan');
    }
    return id;
  }

  // getNotes() {
  //   return this._notes;
  // }

  // getNoteById(id) {
  //   const note = this._notes.filter((n) => n.id === id)[0];
  //   if (!note) {
  //     throw new NotFoundError('Catatan tidak ditemukan');
  //   }
  //   return note;
  // }

  // editNoteById(id, { title, body, tags }) {
  //   const index = this._notes.findIndex((note) => note.id === id);

  //   if (index === -1) {
  //     throw new NotFoundError('Gagal memperbarui catatan. Id tidak ditemukan');
  //   }
  //   const updatedAt = new Date().toISOString();
  //   this._notes[index] = {
  //     ...this._notes[index],
  //     title,
  //     tags,
  //     body,
  //     updatedAt,
  //   };
  // }

  // deleteNoteById(id) {
  //   const index = this._notes.findIndex((note) => note.id === id);

  //   if (index === -1) {
  //     throw new NotFoundError('Catatan gagal dihapus. Id tidak ditemukan');
  //   }

  //   this._notes.splice(index, 1);
  // }
}

module.exports = AlbumsService;
