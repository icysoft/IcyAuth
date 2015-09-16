var IcyErrors = require('IcyErrors');

var errorsManager = IcyErrors.ErrorsManager({moduleCode: 11});

module.exports.manager = errorsManager;
module.exports.codes = {
    generic: 0,
    authErrorCodes: 2
};
