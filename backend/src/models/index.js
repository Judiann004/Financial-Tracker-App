const User = require('./User'); //fixed path to User model
const Transaction = require('./Transaction'); //fixed path to Transaction model

User.hasMany(Transaction, {foreignKey: 'userId'});
Transaction.belongsTo(User, {foreignKey: 'userId'}); //changed belongto to belongsTo

module.exports = {User, Transaction};