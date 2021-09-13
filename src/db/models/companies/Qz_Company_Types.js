const mongoose = require('mongoose')

const QzCompanyTypesSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"]
    },
    is_active: {
        type: Boolean,
        default: true
    }
})


const QzCompanyTypes = mongoose.model(
    'Qz_Company_Types',
    QzCompanyTypesSchema
)

module.exports = QzCompanyTypes;
