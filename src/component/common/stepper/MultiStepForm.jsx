import React, { useState } from 'react';
import { Stepper, Step, StepLabel, Box, Button } from '@mui/material';

/**
 * MultiStepForm - Reusable multi-step form component with Material-UI Stepper
 *
 * @param {Array} steps - Array of step objects: [{ label: 'Step 1', component: <Component /> }]
 * @param {Function} onSubmit - Function to call when final step is submitted
 * @param {Function} onStepValidation - Function to validate current step before proceeding (optional)
 * @param {String} isFormLoading - Loading state indicator ('on' or 'off')
 */
export default function MultiStepForm({ steps, onSubmit, onStepValidation, isFormLoading }) {
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    // Validate current step if validation function provided
    if (onStepValidation) {
      const isValid = onStepValidation(activeStep);
      if (!isValid) return;
    }

    if (activeStep < steps.length - 1) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prevStep) => prevStep - 1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate final step if validation function provided
    if (onStepValidation) {
      const isValid = onStepValidation(activeStep);
      if (!isValid) return;
    }

    // Call parent submit handler
    onSubmit();
  };

  const isLastStep = activeStep === steps.length - 1;
  const isFirstStep = activeStep === 0;

  return (
    <Box sx={{ width: '100%' }}>
      {/* Stepper Header */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((step, index) => (
          <Step key={index}>
            <StepLabel>{step.label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Current Step Content */}
      <Box sx={{ mb: 4 }}>
        {steps[activeStep]?.component}
      </Box>

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2 }}>
        <Button
          variant="outlined"
          onClick={handleBack}
          disabled={isFirstStep}
          sx={{
            textTransform: 'none',
            px: 3,
            visibility: isFirstStep ? 'hidden' : 'visible'
          }}
        >
          Back
        </Button>

        {isLastStep ? (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isFormLoading === 'on'}
            sx={{
              textTransform: 'none',
              px: 4,
              backgroundColor: '#0d6efd',
              '&:hover': {
                backgroundColor: '#0b5ed7'
              }
            }}
          >
            {isFormLoading === 'on' ? (
              <>
                Please wait...
                <span className="spinner-border spinner-border-sm align-middle ms-2" />
              </>
            ) : (
              'Submit'
            )}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleNext}
            sx={{
              textTransform: 'none',
              px: 4,
              backgroundColor: '#0d6efd',
              '&:hover': {
                backgroundColor: '#0b5ed7'
              }
            }}
          >
            Next
          </Button>
        )}
      </Box>
    </Box>
  );
}
