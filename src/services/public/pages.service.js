import * as pagesRepo from '../../repositories/public/pages.repository.js';
import { createHttpError } from '../../utils/httpError.js';

const VALID_PAGE_TYPES = [
  'PRIVACY_POLICY',
  'TERMS_AND_CONDITIONS',
  'ABOUT_APP',
  'COMMUNITY_GUIDELINES',
  'HELP_CENTER'
];

export const getPageByType = async (pageType) => {
  if (!VALID_PAGE_TYPES.includes(pageType)) {
    throw createHttpError(400, 'INVALID_PAGE_TYPE', 'Invalid page type');
  }

  const page = await pagesRepo.findPageByType(pageType);
  if (!page) {
    throw createHttpError(404, 'PAGE_NOT_FOUND', 'Page not found');
  }

  return page;
};

export const getAllPages = async () => {
  const pages = await pagesRepo.findAllPublicPages(VALID_PAGE_TYPES);
  return { pages };
};
