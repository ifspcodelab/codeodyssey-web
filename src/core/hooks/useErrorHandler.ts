import { useState } from 'react';
import { AxiosError } from 'axios';

export function useErrorHandler() {
  const [errorType, setErrorType] = useState('');
  const [openError, setOpenError] = useState(false);

  const handleError = (error: AxiosError) => {
    let responseStatus: number;
    let problemDetail: ProblemDetail = { title: '', detail: '', instance: '', status: 0, type: '' };
    
    if (error.response) {
      problemDetail = error.response.data as ProblemDetail
      responseStatus = problemDetail.status
      console.log(error.response.data)
      if(responseStatus == 403) {
        if (problemDetail.detail == "Bad credentials") {
            setErrorType('invalidLoginOrEmail');
          setOpenError(true);
          }
      }  
      if (responseStatus == 400) {
        if (problemDetail.detail == "must be a future date") {
          setErrorType('invalidStartDate')
          setOpenError(true);
        } else {
          setErrorType('badRequest')
          setOpenError(true);
        }
      } else if (responseStatus == 409) {
        if (error.response) problemDetail = error.response.data as ProblemDetail
        if (problemDetail.title === "Course Already exists") {
          setErrorType('courselAlreadyExists')
          console.log(problemDetail)
          setOpenError(true);
        } 
        if (problemDetail.title === "Resolution Submit date later than its activity end date") {
          setErrorType('unexpected')
          setOpenError(true);
        }
        if (problemDetail.title === "Course Slug not found") {
          setErrorType('slugNotFound')
          setOpenError(true);
        } 
        if (problemDetail.title == "User Already exists" && problemDetail.detail == "Email already exists") {
          setErrorType('emailAlreadyExists')
          setOpenError(true);
        }   
      } else if (responseStatus == 404) { 
        setErrorType('notFound');
        setOpenError(true);
      } else if (responseStatus === 422) {
       setErrorType('resendEmailDelay');     
       setOpenError(true);
      }
    } else if (error.message == "Network Error") {
      setErrorType('networkError')
      setOpenError(true);
    }
  };

  const handleCloseError = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway' || event === undefined) {
      return;
    }
    setOpenError(false);
  };

  return { handleError, openError, errorType, handleCloseError };
}