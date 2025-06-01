/* eslint-disable no-underscore-dangle */
const ClientError = require('../../exceptions/ClientError');

class PlaylistHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
    this.addCollaboratorHandler = this.addCollaboratorHandler.bind(this);
  }

  async postPlaylistHandler(request, h) {
    try {
      this._validator.validatePlaylistPayload(request.payload);
      const { name } = request.payload;
      const { id: credentialId } = request.auth.credentials;

      const playlistId = await this._service.addPlaylist({ name, owner: credentialId });

      const response = h.response({
        status: 'success',
        message: 'Playlist berhasil ditambahkan',
        data: {
          playlistId,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  // async getPlaylistsHandler(request, h) {
  //   try {
  //     const { id: credentialId } = request.auth.credentials;
  //     const playlists = await this._service.getPlaylists(credentialId);

  //     return {
  //       status: 'success',
  //       data: {
  //         playlists: playlists.map((playlist) => ({
  //           id: playlist.id,
  //           name: playlist.name,
  //           username: playlist.username,
  //         })),
  //       },
  //     };
  //   } catch (error) {
  //     console.error('Error in getPlaylistsHandler:', error);
  //     const response = h.response({
  //       status: 'error',
  //       message: 'Maaf, terjadi kegagalan pada server kami.',
  //     });
  //     response.code(500);
  //     return response;
  //   }
  // }
  async getPlaylistsHandler(request, h) {
    try {
      const { id: credentialId } = request.auth.credentials;
      const playlists = await this._service.getPlaylists(credentialId);

    return h.response({
      status: 'success',
      data: {
        playlists: playlists.map((playlist) => ({
          id: playlist.id,
          name: playlist.name,
          username: playlist.username,
        })),
      }
    }).code(200); // Explicit success status code
  } catch (error) {
    console.error('Error in getPlaylistHandler:', error);
    return h.response({
      status: 'error',
      message: 'Maaf, terjadi kegagalan pada server kami.'
    }).code(500);
  }
  }



  async deletePlaylistByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._service.verifyPlaylistOwner(id, credentialId);
      await this._service.deletePlaylistById(id);
      return {
        status: 'success',
        message: 'Playlist berhasil dihapus',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async addCollaboratorHandler(request, h) {
    try {
      const { id: playlistId } = request.params;
      const { userId } = request.payload;
      const { id: credentialId } = request.auth.credentials;
  
      // Only owner can add collaborator
      await this._service.verifyPlaylistOwner(playlistId, credentialId);
  
      // Add collaborator using PlaylistSongsService
      await this._service._playlistSongService.addCollaborator(playlistId, userId);
  
      const response = h.response({
        status: 'success',
        message: 'Kolaborator berhasil ditambahkan',
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
}
module.exports = PlaylistHandler;
