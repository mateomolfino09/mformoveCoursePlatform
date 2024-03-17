const fileSchema = new mongoose.Schema(
    {
      id: {
        type: Number,
        required: true
      },
      document_url: {
        type: String,
        required: true
      },
      public_id: {
        type: String,
        required: true
      },
      name: {
        type: String
      },
      format: {
        type: String
      }
    }
  )
  
  const linkSchema = new mongoose.Schema(
    {
      id: {
        type: Number,
        required: true
      },
      link_url: {
        type: String,
        required: true
      },
    }
  )
  
    const classSchema = new mongoose.Schema(
    {
      id: {
        type: Number,
        required: true
      },
      name: {
        type: String,
        required: true
      },
      createdAt: {
        type: Date,
        immutable: true,
        default: () => Date.now()
      },
      class_code: {
        type: String,
        required: true
      },
      image_url: {
        type: String,
        required: true
      },
      totalTime: {
        type: Number,
        default: () => 0
      },
      module: {
        type: Number,
        required: true
      },
      atachedFiles: [
        fileSchema
      ],
      links: [
        linkSchema
      ]
    },
    { timestamps: true }
  );
  
  const workShopSchema = new mongoose.Schema(
    {
      id: {
        type: Number,
        required: true
      },
      name: {
        type: String,
        required: true
      },
      description: {
        type: String,
        required: true,
        minLength: 20
      },
      paymentLink: {
      type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        immutable: true,
        default: () => Date.now()
      },
      classesQuantity: {
        type: Number,
        required: true
      },
      image_url: {
        type: String,
        required: true
      },
      diploma_url: {
        type: String
      },
      course_type: {
        type: String,
        required: true
      },
      likes: {
        type: Number,
        default: () => 12
      },
      price: {
        type: Number,
        default: () => 10
      },
      currency: {
        type: String,
        default: () => '$'
      },
      course_type: {
        type: String,
      },
      users: [
        {
          type: mongoose.Types.ObjectId,
          ref: 'User'
        }
      ],
      classes: [classesSchema],
      created_by: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
      }
    },
    { timestamps: true }
  );