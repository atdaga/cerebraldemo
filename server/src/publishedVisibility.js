const privateUser = (user) => {
  const {
    id,
    username,
    primaryEmail,
    primaryEmailVerified,
    primaryPhone,
    primaryPhoneVerified,
    enabled,
    timeZone,
    namePrefix,
    firstName,
    middleName,
    lastName,
    nameSuffix,
    displayName,
    defaultLocale,
    iconId,
    preferences,
    systemRole,
    created,
    createdBy,
    lastModified,
    lastModifiedBy
  } = user;
  return {
    id,
    username,
    primaryEmail,
    primaryEmailVerified,
    primaryPhone,
    primaryPhoneVerified,
    enabled,
    timeZone,
    namePrefix,
    firstName,
    middleName,
    lastName,
    nameSuffix,
    displayName,
    defaultLocale,
    iconId,
    preferences,
    systemRole,
    created,
    createdBy,
    lastModified,
    lastModifiedBy
  };
};

const publicUser = (user) => {
  const ret = privateUser(user);
  delete ret.username;
  delete ret.primaryEmail;
  delete ret.primaryEmailVerified;
  delete ret.primaryPhone;
  delete ret.primaryPhoneVerified;
  delete ret.timeZone;
  delete ret.defaultLocale;
  if ((ret.preferences) && (ret.preferences.private)) {
    delete ret.preferences.private;
  }
  return ret;
};

const publicUsers = (users) => {
  return users.map((user) => {
    return publicUser(user);
  });
};


const publicQuestions = (questions) => {
  return questions;
};


// Index in the array is the version number to publish against.
export const apiVersionedVisibility = {
  privateUser: {
    latest: privateUser
  },
  publicUser: {
    latest: publicUser
  },
  publicUsers: {
    latest: publicUsers
  },
  publicQuestions: {
    latest: publicQuestions
  }
};

export const publishByApiVersion = (req, publishers, ...args) => {
  // Always the latest for publishing.  This implies backwards compatability for publishing.
  return publishers.latest(...args);
  // return publishers[req.apiVersion.toString()](...args);
};
