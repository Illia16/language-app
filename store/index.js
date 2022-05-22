export const state = () => ({
	count: 0,
    mode: null,
});

export const actions = {
	count({ commit }, number) {
		commit('count', number);
	},
	mode({ commit }, mode) {
		commit('mode', mode);
	},
};

export const getters = {
	count: (state) => state.count,
	mode: (state) => state.mode,
};

export const mutations = {
	count(state, number) {
		state.count = number;
	},
	mode(state, mode) {
		state.mode = mode;
	},
};
