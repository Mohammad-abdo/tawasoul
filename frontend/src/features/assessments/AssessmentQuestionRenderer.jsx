import { getAssessmentConfig } from './assessmentRegistry';

const AssessmentQuestionRenderer = (props) => {
  const config = getAssessmentConfig(props.test?.testType);
  const Renderer = config.component;

  return <Renderer {...props} />;
};

export default AssessmentQuestionRenderer;
