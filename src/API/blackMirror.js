const API_BASE_URL = 'http://localhost:5999';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const blackMirrorAPI = {
  debates: {
    getCurrent: async () => {
      const res = await fetch(`${API_BASE_URL}/api/debates/current`);
      return res.json();
    },
    getAll: async () => {
      const res = await fetch(`${API_BASE_URL}/api/debates`);
      return res.json();
    },
    getById: async (id) => {
      const res = await fetch(`${API_BASE_URL}/api/debates/${id}`);
      return res.json();
    },
    create: async (data) => {
      const res = await fetch(`${API_BASE_URL}/api/debates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    update: async (id, data) => {
      const res = await fetch(`${API_BASE_URL}/api/debates/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    delete: async (id) => {
      const res = await fetch(`${API_BASE_URL}/api/debates/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });
      return res.json();
    }
  },

  votes: {
    submit: async (debateId, side) => {
      const res = await fetch(`${API_BASE_URL}/api/votes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({ debate_id: debateId, side })
      });
      return res.json();
    },
    getStatus: async (debateId) => {
      const res = await fetch(`${API_BASE_URL}/api/votes/status/${debateId}`, {
        headers: getAuthHeader()
      });
      return res.json();
    },
    getStats: async (debateId) => {
      const res = await fetch(`${API_BASE_URL}/api/votes/stats/${debateId}`);
      return res.json();
    }
  },

  comments: {
    getList: async (debateId) => {
      const res = await fetch(`${API_BASE_URL}/api/comments/${debateId}`);
      return res.json();
    },
    create: async (data) => {
      const res = await fetch(`${API_BASE_URL}/api/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    toggleLike: async (commentId) => {
      const res = await fetch(`${API_BASE_URL}/api/comments/${commentId}/like`, {
        method: 'POST',
        headers: getAuthHeader()
      });
      return res.json();
    },
    toggleHot: async (commentId, isHot) => {
      const res = await fetch(`${API_BASE_URL}/api/comments/${commentId}/hot`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({ is_hot: isHot })
      });
      return res.json();
    }
  },

  analysis: {
    getByDebate: async (debateId) => {
      const res = await fetch(`${API_BASE_URL}/api/analysis/${debateId}`);
      return res.json();
    },
    create: async (data) => {
      const res = await fetch(`${API_BASE_URL}/api/analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    update: async (id, data) => {
      const res = await fetch(`${API_BASE_URL}/api/analysis/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    delete: async (id) => {
      const res = await fetch(`${API_BASE_URL}/api/analysis/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });
      return res.json();
    }
  },

  user: {
    getVotes: async () => {
      const res = await fetch(`${API_BASE_URL}/api/user/votes`, {
        headers: getAuthHeader()
      });
      return res.json();
    },
    getComments: async () => {
      const res = await fetch(`${API_BASE_URL}/api/user/comments`, {
        headers: getAuthHeader()
      });
      return res.json();
    }
  }
};

export default blackMirrorAPI;