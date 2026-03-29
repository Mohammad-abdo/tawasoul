import * as homeRepo from '../../repositories/public/home.repository.js';

export const getHomePageData = async () => {
  const [sliders, services, articles] = await Promise.all([
    homeRepo.findActiveSliders(),
    homeRepo.findActiveServices(),
    homeRepo.findActiveArticles()
  ]);

  return {
    sliders: sliders.map((slider) => ({
      id: slider.id,
      title: slider.titleAr || slider.titleEn || '',
      description: slider.descriptionAr || slider.descriptionEn || '',
      imageUrl: slider.image,
      buttonText: slider.buttonText,
      buttonLink: slider.buttonLink
    })),
    services: services.map((service) => ({
      id: service.id,
      title: service.titleAr || service.titleEn || '',
      description: service.descriptionAr || service.descriptionEn || '',
      imageUrl: service.image,
      link: service.link
    })),
    articles: articles.map((article) => ({
      id: article.id,
      title: article.titleAr || article.titleEn || '',
      description: article.descriptionAr || article.descriptionEn || '',
      imageUrl: article.image,
      link: article.link
    }))
  };
};

export const getFAQs = async ({ category }) => {
  const where = { isActive: true };
  if (category) {
    where.category = category;
  }

  const faqs = await homeRepo.findActiveFaqs(where);

  return faqs.map((faq) => ({
    id: faq.id,
    question: faq.questionAr || faq.questionEn || '',
    answer: faq.answerAr || faq.answerEn || '',
    category: faq.category
  }));
};
