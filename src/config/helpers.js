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

const SendErrorsAsResponse = (err, responseCallback, errorMessage) => {
  const errorMessages =
    err && err.errors
      ? ParseModelValidationErrorMessages(err.errors)
      : []
  return responseCallback.status(400).send({
    status_code: 2,
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

module.exports = {
  GenerateSixDigitCode,
  ParseModelValidationErrorMessages,
  SendErrorsAsResponse,
  SendSuccessResponseWithAuthHeader,
  SendSuccessResponse
}
