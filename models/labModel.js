import mongoose, { Types } from 'mongoose';

const labSchema = new mongoose.Schema({
    topic: {
        type: String,
        required: [true, 'Please give a topic']
    },
    batch: {
        type: String,
        required: [true, "Please enter a batch"]
    },
    questions: [
        {
            type: Types.ObjectId,
            ref: "Question",
        }
    ],
    successfulSubmissions: [
        {
            submissionIds : [
                {
                    type: Types.ObjectId,
                    ref: "User",
                }
            ]
        }
    ],
    duration: {
        type : Number,
        required: [true,"Please enter the duration"]
    },
    isStart :{
        type: Boolean,
        default: false
    },
    isEnd :{
        type: Boolean,
        default: false
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

labSchema.methods.startLab = async function() {
    if (this.isStart) {
        throw new ErrorHandler('Lab is already started');
    }

    this.isStart = true;
    await this.save();

    // Start the countdown
    const interval = setInterval(async () => {
        if (this.duration > 0) {
            this.duration -= 1;
            await this.save();
        } else {
            this.isEnd = true;
            this.isStart = false;
            await this.save();
            clearInterval(interval);
            // console.log(Lab ${this._id} has ended.);
        }
    }, 1000);
};

const Lab = mongoose.model('Lab', labSchema);

export default Lab;