const users = {
    user_a: {
        username: 'user_a',
        userId: 'user_a___uuid',
        password: 'user_a_pw',
        role: 'admin',
        email: 'user_a@email.illusha.net',
        tier: 'premium',
    },
    user_b: {
        username: 'user_b',
        userId: 'user_b___uuid',
        password: 'user_b_pw',
        role: 'user',
        email: 'user_b@email.illusha.net',
        tier: 'default',
    },
    user_c: {
        username: 'user_c',
        userId: 'user_c___uuid',
        password: 'user_c_pw',
        role: 'delete',
        email: 'user_c@email.illusha.net',
        tier: 'default',
    },
    user_d: {
        username: 'user_d',
        userId: 'user_d___uuid',
        password: 'user_d_pw',
        role: 'user',
        email: 'user_d@email.illusha.net',
        tier: 'default',
    },
    user_e: {
        username: 'user_e',
        userId: 'user_e___uuid',
        password: 'user_e_pw',
        role: 'user',
        email: 'user_e@email.illusha.net',
        tier: 'default',
    },
}

const temp_users = {
    user_delete: {
        username: 'user_delete',
        userId: 'user_delete___uuid',
        password: 'user_delete_pw',
        role: 'delete',
        email: 'user_delete@email.illusha.net',
        tier: 'default',
    },
}

module.exports = { users, temp_users };