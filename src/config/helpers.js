const CryptoJS = require("crypto-js");
const config = require('./appConfig')

const GenerateSixDigitCode = () => {
  var min = 100000
  var max = 900000
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const ParseModelValidationErrorMessages = errors => {
  return Object.keys(errors).map(modelKey => {
    return errors[modelKey].message
  })
}

const SendErrorsAsResponse = (
  err,
  responseCallback,
  errorMessage,
  status_code = 2
) => {
  const errorMessages =
    err && err.errors ? ParseModelValidationErrorMessages(err.errors) : []
  return responseCallback.status(400).send({
    status_code: status_code,
    message: errorMessage || err.message,
    errors: errorMessages
  })
}

const SendSuccessResponseWithAuthHeader = (
  responseCallback,
  token,
  response
) => {
  return responseCallback
    .header({
      'x-auth-token': token,
      'Access-Control-Expose-Headers': ['Content-Encoding', 'x-auth-token']
    })
    .status(201)
    .send(response)
}

const SendSuccessResponse = (responseCallback, response) => {
  return responseCallback.status(201).send(response)
}

const GetEncryptedText = (textToEncrypt) => {
  return CryptoJS.AES.encrypt(textToEncrypt.toString(), config.encryption.secret_key).toString();
}

const GetDecryptedText = (textToDecrypt) => {
  return CryptoJS.AES.decrypt(textToDecrypt, config.encryption.secret_key).toString(CryptoJS.enc.Utf8);
}

const CompareEncryptedTextWithPlainText = (plainText, encryptedText) => {
  const decryptedText = GetDecryptedText(encryptedText);
  return plainText.toString() === decryptedText;
}

module.exports = {
  GenerateSixDigitCode,
  ParseModelValidationErrorMessages,
  SendErrorsAsResponse,
  SendSuccessResponseWithAuthHeader,
  SendSuccessResponse,
  GetEncryptedText,
  GetDecryptedText,
  CompareEncryptedTextWithPlainText
}
