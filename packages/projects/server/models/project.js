'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;


/**
 * Project Schema
 */
var ProjectSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  //project activity log
  activity: [{
    action: String,
    date: {type: Date, default: Date.now},
    userId: String
  }],
  //General info needed for every project request
  general: {
    name: {
      first: {
        type: String,
        required: true,
        trim: true
      },
      last:{
        type:String,
        required: true,
        trim: true
      }
    },
    department: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true
    },
    costCenter: {
      type: String,
      required: true,
      trim: true
    },
    additionalInfo: {
      type: String,
      required: false,
      trim: true
    },
    projectName: {
      type: String,
      required: true,
      trim: true
    },
    projectDescription: {
      type: String,
      required: true,
      trim: true
    },
    completionDate: {
      type: String,
      required: true,
      trim: true
    },
    departmentHeadApproving: {
      type: String,
      required: true,
      trim: true
    },
    projectAudience: {
      type: String,
      trim: true
    },
    projectMessage: {
      type: String,
      trim: true
    }
  },
  // Items requested for the project
  items: [{
    title: String,
    progress: {type: Number, default: 0},
    status: String,
    users: [{
      _id: String,
      username: String,
      status: String
    }],
    fileCount: Number,
    files: [{
      src: String,
      name: String,
      size: String,
      kind: String,
      description: String,
      user: {
        name: {
          first: String,
          last: String
        },
        username: String,
        _id: String
      }
    }],
    itemType: String,
    subType: String,
    businessLine: String,
    description: String,
    marketLead: String,
    distCodes: String,
    template: String,
    url: String,
    content: String,
    cta: String,
    audience: String,
    message: String,
    billing: {
      addressOne: String,
      addressTwo: String,
      city: String,
      state: String,
      zip: Number,
      country: String,
      attention: String
    },
    quantity: Number,
    dimensions: {
      width: Number,
      height: Number
    },
    mounted: Boolean,
    grommets: Boolean,
    polePockets: Boolean,
    completionDate: String,
    confidential: String
  }],
  progress: {
    type: Number
  },
  progresslength: {
    type: Number
  },
  progresstotal: {
    type: Number,
    default: 0
  },
  notifications: [{
    items: [{
      department: String,
      item: String,
      description: String
    }],
    text: String,
    userId: String,
    username: String,
    useremail: String,
    completed: Boolean
  }],
  discussions: [{
    subject: String,
    creator: {
      name: {
        first: String,
        last: String
      },
      username: String,
      _id: String
    },
    created: Date,
    projectItem: String,
    messageCount: Number,
    messages: [{
      content: String,
      author: {
        name: {
          first: String,
          last: String
        },
        username: String,
        _id: String
      },
      created: Date
    }]
  }],
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

/**
 * Validations
 */
ProjectSchema.path('general.name.first').validate(function(first) {
  return !!first;
}, 'First name cannot be blank');

ProjectSchema.path('general.name.last').validate(function(last) {
  return !!last;
}, 'Last name cannot be blank');

ProjectSchema.path('general.department').validate(function(department) {
  return !!department;
}, 'Department cannot be blank');

ProjectSchema.path('general.email').validate(function(email) {
  return !!email;
}, 'Email cannot be blank');

ProjectSchema.path('general.costCenter').validate(function(costCenter) {
  return !!costCenter;
}, 'Cost center cannot be blank');

ProjectSchema.path('general.projectName').validate(function(projectName) {
  return !!projectName;
}, 'Project name cannot be blank');

ProjectSchema.path('general.projectDescription').validate(function(projectDetails) {
  return !!projectDetails;
}, 'Project details cannot be blank');

ProjectSchema.path('general.completionDate').validate(function(completionDate) {
  return !!completionDate;
}, 'Completion date cannot be blank');

ProjectSchema.path('general.departmentHeadApproving').validate(function(departmentHeadApproving) {
  return !!departmentHeadApproving;
}, 'Department head approving this request cannot be blank');


/**
 * Statics
 */
ProjectSchema.statics.load = function(id, cb) {
  this.findOne({
    _id: id
  }).populate('user', 'name username').exec(cb);
};

mongoose.model('Project', ProjectSchema);
