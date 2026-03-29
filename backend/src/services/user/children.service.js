import * as childrenRepo from '../../repositories/user/children.repository.js';

const VALID_STATUSES = ['AUTISM', 'SPEECH_DISORDER'];
const VALID_AGE_GROUPS = ['UNDER_4', 'BETWEEN_5_15', 'OVER_15'];

const mapStatus = (status) => {
  const s = String(status).trim();
  if (s === 'توحد' || s.toLowerCase() === 'autism') return 'AUTISM';
  if (s === 'تخاطب' || s.toLowerCase() === 'speech_disorder' || s.toLowerCase() === 'speech therapy') return 'SPEECH_DISORDER';
  if (VALID_STATUSES.includes(s)) return s;
  return null;
};

const mapAgeGroup = (ageGroup) => {
  const a = String(ageGroup).trim();
  if (a === 'اقل من 4 سنوات' || a === 'أقل من 4 سنوات' || a.toLowerCase() === 'under_4') return 'UNDER_4';
  if (a === '4 سنوات الي 15 سنه' || a === '4 سنوات إلى 15 سنة' || a.toLowerCase() === 'between_5_15') return 'BETWEEN_5_15';
  if (a === 'اكبر من 15 سنه' || a === 'أكبر من 15 سنة' || a.toLowerCase() === 'over_15') return 'OVER_15';
  if (VALID_AGE_GROUPS.includes(a)) return a;
  return null;
};

const notFound = () => {
  const err = new Error('Child profile not found');
  err.code = 'CHILD_NOT_FOUND';
  err.status = 404;
  return err;
};

const forbidden = () => {
  const err = new Error('You can only access your own child profiles');
  err.code = 'FORBIDDEN';
  err.status = 403;
  return err;
};

export const getUserChildren = (userId) =>
  childrenRepo.findAllByUserId(userId);

export const getChildById = async (userId, id) => {
  const child = await childrenRepo.findById(id);
  if (!child) throw notFound();
  if (child.userId !== userId) throw forbidden();
  return child;
};

export const createChild = async (userId, { name, status, ageGroup, behavioralNotes, caseDescription, profileImage }) => {
  if (!name || !status || !ageGroup) {
    const err = new Error('Name, status, and age group are required');
    err.code = 'VALIDATION_ERROR';
    err.status = 400;
    throw err;
  }

  if (!VALID_STATUSES.includes(status)) {
    const err = new Error('Invalid status. Must be AUTISM or SPEECH_DISORDER');
    err.code = 'VALIDATION_ERROR';
    err.status = 400;
    throw err;
  }

  if (!VALID_AGE_GROUPS.includes(ageGroup)) {
    const err = new Error('Invalid age group. Must be UNDER_4, BETWEEN_5_15, or OVER_15');
    err.code = 'VALIDATION_ERROR';
    err.status = 400;
    throw err;
  }

  return childrenRepo.createChild({
    userId,
    name,
    status,
    ageGroup,
    behavioralNotes: behavioralNotes || null,
    caseDescription: caseDescription || null,
    profileImage: profileImage || null
  });
};

export const updateChild = async (userId, id, updates) => {
  const existing = await childrenRepo.findByIdSimple(id);
  if (!existing) throw notFound();
  if (existing.userId !== userId) throw forbidden();

  const { status, ageGroup } = updates;

  if (status && !VALID_STATUSES.includes(status)) {
    const err = new Error('Invalid status. Must be AUTISM or SPEECH_DISORDER');
    err.code = 'VALIDATION_ERROR';
    err.status = 400;
    throw err;
  }

  if (ageGroup && !VALID_AGE_GROUPS.includes(ageGroup)) {
    const err = new Error('Invalid age group. Must be UNDER_4, BETWEEN_5_15, or OVER_15');
    err.code = 'VALIDATION_ERROR';
    err.status = 400;
    throw err;
  }

  const { name, behavioralNotes, caseDescription, profileImage } = updates;

  return childrenRepo.updateChild(id, {
    ...(name && { name }),
    ...(status && { status }),
    ...(ageGroup && { ageGroup }),
    ...(behavioralNotes !== undefined && { behavioralNotes }),
    ...(caseDescription !== undefined && { caseDescription }),
    ...(profileImage !== undefined && { profileImage })
  });
};

export const deleteChild = async (userId, id) => {
  const child = await childrenRepo.findByIdSimple(id);
  if (!child) throw notFound();
  if (child.userId !== userId) throw forbidden();
  await childrenRepo.deleteChild(id);
};

export const submitChildSurvey = async (userId, { name, status, ageGroup, behavioralNotes }) => {
  if (!status || !ageGroup) {
    const err = new Error('حالة الطفل وعمر الطفل مطلوبان');
    err.code = 'VALIDATION_ERROR';
    err.status = 400;
    throw err;
  }

  const mappedStatus = mapStatus(status);
  if (!mappedStatus) {
    const err = new Error('حالة الطفل غير صحيحة. يجب أن تكون "توحد" أو "تخاطب"');
    err.code = 'VALIDATION_ERROR';
    err.status = 400;
    throw err;
  }

  const mappedAgeGroup = mapAgeGroup(ageGroup);
  if (!mappedAgeGroup) {
    const err = new Error('فئة العمر غير صحيحة');
    err.code = 'VALIDATION_ERROR';
    err.status = 400;
    throw err;
  }

  if (behavioralNotes) {
    const notes = String(behavioralNotes).trim();
    if (notes.length > 250) {
      const err = new Error(`ملاحظات السلوك يجب ألا تتجاوز 250 حرفاً. الحروف المدخلة: ${notes.length}`);
      err.code = 'VALIDATION_ERROR';
      err.status = 400;
      throw err;
    }
  }

  const existingCount = await childrenRepo.countByUserId(userId);
  const childName = name && name.trim() ? name.trim() : `طفل ${existingCount + 1}`;

  const child = await childrenRepo.createChild({
    userId,
    name: childName,
    status: mappedStatus,
    ageGroup: mappedAgeGroup,
    behavioralNotes: behavioralNotes ? String(behavioralNotes).trim() : null
  });

  return {
    child: {
      id: child.id,
      name: child.name,
      status: child.status,
      ageGroup: child.ageGroup,
      behavioralNotes: child.behavioralNotes,
      createdAt: child.createdAt
    },
    surveyCompleted: true
  };
};
