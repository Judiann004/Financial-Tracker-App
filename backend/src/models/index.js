const User = require('../User');
const Transaction = require('../Transaction');

User.hasMany(Transaction, {foreignKey: 'userId'});
Transaction.belongTo(User, {foreignKey: 'userId'});

module.exports = {User, Transaction};