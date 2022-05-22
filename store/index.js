export const state = () => ({
	count: 0,
});

export const actions = {
	count({ commit }, number) {
		commit('count', number);
	},
};

export const getters = {
	count: (state) => state.count,
};

export const mutations = {
	count(state, number) {
		state.count = number;
	},
};
