import React from "react";
import MultiStepForm from "../../common/stepper/MultiStepForm";
import CourseBasicInfo from "./steps/CourseBasicInfo";
import CourseAcademicDetails from "./steps/CourseAcademicDetails";
import CourseFinancialInfo from "./steps/CourseFinancialInfo";

export default function CourseForm(props) {
    const steps = [
        {
            label: 'Basic Information',
            component: (
                <CourseBasicInfo
                    data={props.data}
                    onEdit={props.onEdit}
                    departmentList={props.departmentList}
                />
            )
        },
        {
            label: 'Academic Details',
            component: (
                <CourseAcademicDetails
                    data={props.data}
                    onEdit={props.onEdit}
                />
            )
        },
        {
            label: 'Financial & Classification',
            component: (
                <CourseFinancialInfo
                    data={props.data}
                    onEdit={props.onEdit}
                />
            )
        }
    ];

    return (
        <MultiStepForm
            steps={steps}
            onSubmit={props.onSubmit}
            onStepValidation={props.onStepValidation}
            isFormLoading={props.isFormLoading}
        />
    )
}
