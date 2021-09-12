const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const { MailService } = require('../lib/services')
const helpers = require('../config/helpers')
const appConfig = require('../config/appConfig')
const jwt = require('jsonwebtoken')
const { QzCrUserRegistration, QzCrUserProfile } = require('../db/models')

class CorporateUserController {
    static async userSignup(req, res) {
        try {
            const { user_name, email, mobile_no } = req.body

            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(req.body.password, salt)

            const emailVerificationOtp = helpers.GenerateSixDigitCode()

            const userRegistrationResult = await new QzCrUserRegistration({
                user_name,
                email,
                password: hashedPassword,
                mobile_no,
                otp: emailVerificationOtp
            })

            await userRegistrationResult.save()

            await MailService.sendMail(email, 'OTP For Quazi App Registration', emailVerificationOtp)

            const token = userRegistrationResult.generateAuthToken()
            const {
                password,
                _id,
                otp,
                ...userRegistrationDoc
            } = userRegistrationResult._doc

            let response = {
                status_code: 1,
                message:
                    'Your account registration is successful and an OTP has been sent to your email for verification',
                result: [{ ...userRegistrationDoc, user_id: _id }]
            }

            return helpers.SendSuccessResponseWithAuthHeader(res, token, response)
        } catch (err) {
            return helpers.SendErrorsAsResponse(err, res)
        }
    }

    static async emailVerification(req, res) {
        const { email, otp } = req.body

        try {
            const userResult = await QzCrUserRegistration.findOne({
                email
            });

            let response = ''

            if (userResult && userResult.otp && !userResult.is_email_verified) {
                if (parseInt(userResult.otp) === parseInt(otp)) {
                    const { modifiedCount } = await userResult.updateOne({
                        is_email_verified: true
                    })

                    if (modifiedCount) {
                        response = {
                            status_code: 1,
                            message: 'Your account has been verified!'
                        }
                        return helpers.SendSuccessResponse(res, response)
                    }

                    return helpers.SendErrorsAsResponse(
                        null,
                        res,
                        'Error occured while email verification, please try again!'
                    )
                }

                return helpers.SendErrorsAsResponse(
                    null,
                    res,
                    'Email verification failed, invalid OTP!'
                )
            }

            return helpers.SendErrorsAsResponse(
                null,
                res,
                'Account is already verified!'
            )
        } catch (err) {
            return helpers.SendErrorsAsResponse(err, res)
        }
    }

    static async userProfileUpdate(req, res) {
        try {
            const {
                first_name,
                last_name,
                company_name,
                company_registration_number,
                company_hq,
                company_profile,
                complete_address,
                company_type_id,
                agreement_terms_conditions,
                is_active
            } = req.body

            await QzCrUserProfile.findOneAndUpdate(
                { user_id: req.params.id },
                {
                    first_name,
                    last_name,
                    company_name,
                    company_registration_number,
                    company_hq,
                    company_profile,
                    complete_address,
                    company_type_id,
                    agreement_terms_conditions,
                    is_active
                },
                { new: true, upsert: true }
            );

            const token = jwt.sign(
                { _id: req.params.id },
                appConfig.auth.jwt_secret,
                { expiresIn: appConfig.auth.jwt_expires_in }
            )

            let response = {
                status_code: 1,
                message: 'Corporate User Profile Successfully Updated',
                result: []
            }

            return helpers.SendSuccessResponseWithAuthHeader(res, token, response)
        } catch (err) {
            return helpers.SendErrorsAsResponse(err, res)
        }
    }
}

module.exports = CorporateUserController;