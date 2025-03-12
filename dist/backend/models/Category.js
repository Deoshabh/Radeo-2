import mongoose from 'mongoose';
const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});
const Category = mongoose.model('Category', categorySchema);
export default Category;
