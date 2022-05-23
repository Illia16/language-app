export const state = () => ({
	count: 0,
    mode: null,
    started: false,
});

export const actions = {
	count({ commit }, number) {
		commit('count', number);
	},
	mode({ commit }, mode) {
		commit('mode', mode);
	},
	started({ commit }, started) {
		commit('started', started);
	},
};

export const getters = {
	count: (state) => state.count,
	mode: (state) => state.mode,
	started: (state) => state.started,
};

export const mutations = {
	count(state, number) {
		state.count = number;
	},
	mode(state, mode) {
		state.mode = mode;
	},
	started(state, started) {
		state.started = started;
	},
};
