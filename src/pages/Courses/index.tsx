import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";
import axios, { AxiosError } from "axios";
import { useLocation, useSearchParams } from 'react-router-dom';
// import './style.css'
import Typography from '@mui/material/Typography';
import { AuthConsumer } from "../../core/auth/AuthContext.tsx";
import { JwtService } from "../../core/auth/JwtService.ts";
import { CourseResponse } from "../../core/models/CourseResponse";
import { useApiGetCourses } from "../../core/hooks/useApiGetCourses.ts";
import ErrorSnackBar from "../../components/ErrorSnackBar/ErrorSnackBar";
import Spinner from "../../components/Spinner";
import SuccessrSnackBar from "../../components/SuccessSnackBar/index.tsx";
import CoursesList from './CoursesProfessor.tsx'
import CoursesStudent from './CoursesStudent.tsx'
import { PageBaseLayout } from "../../core/layout/PageBaseLayout.tsx";
import { ToolBar } from "../../core/components/tool-bar/ToolBar.tsx";
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";

const Courses: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const success = queryParams.get('success');

  const authConsumer = AuthConsumer();
  const USER_ID: string = authConsumer.id;
  const USER_ROLE: string = authConsumer.role;
  const rawAccessToken = new JwtService().getRawAccessToken() as string;
  const { getCoursesProfessor, getCoursesStudent } = useApiGetCourses()

  const [coursesStudent, setCoursesStudent] = useState<CourseResponse[] | ProblemDetail>([]);
  const [coursesProfessor, setCoursesProfessor] = useState<CourseResponse[] | ProblemDetail>([]);
  const [errorType, setErrorType] = useState('');
  const [openSuccess, setOpenSuccess] = useState(true);
  const [openError, setOpenError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      if (USER_ROLE == "PROFESSOR") {
        try {
          const coursesProfessorResponse = await getCoursesProfessor(USER_ID, rawAccessToken);
          setCoursesProfessor(coursesProfessorResponse)
          const coursesStudentResponse = await getCoursesStudent(USER_ID, rawAccessToken)
          setCoursesStudent(coursesStudentResponse)
          setLoading(false)
        } catch (error) {
          if (axios.isAxiosError(error)) {
            handleError(error)
          } else {
            setErrorType('unexpected')
          }
        }
      } else if (USER_ROLE == "STUDENT") {
        const coursesStudentResponse = await getCoursesStudent(USER_ID, rawAccessToken)
        setCoursesStudent(coursesStudentResponse)
        setLoading(false)
      }
    })();
    // eslint-disable-next-line
  }, [USER_ID, USER_ROLE, rawAccessToken]);

  useEffect(() => {
    if (success) {
      const newURL = window.location.pathname;
      window.history.replaceState({}, document.title, newURL);
    }
  }, [success]);

  const handleCloseSuccess = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway' || event === undefined) {
      return;
    }

    setOpenSuccess(false);
  };

  const handleCloseError = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway' || event === undefined) {
      return;
    }

    setOpenError(false);
  };

  const handleError = (error: AxiosError) => {
    let responseStatus: number
    let problemDetail: ProblemDetail = { title: '', detail: '', instance: '', status: 0, type: '' }
    if (error.response) {
      problemDetail = error.response.data as ProblemDetail
      responseStatus = problemDetail.status
      if (responseStatus == 400) {
        setErrorType('badRequest')
        setOpenError(true);
      }
    } else if (error.message == "Network Error") {
      setErrorType('networkError')
      setOpenError(true);
    }
  }

  const [searchParams, setSearchParams] = useSearchParams();

  const search = useMemo(() => {
    return searchParams.get('search') || ''
  }, [searchParams])

  return (
    <>
      <PageBaseLayout title={t('courses.title')}
        toolbar={(<ToolBar
          showSearchInput
          textSearch={search}
          onChangeTextSearch={text => setSearchParams({ search: text }, { replace: true })}
        />
        )}>
      </PageBaseLayout>

      <TableContainer component={Paper} variant="outlined" sx={{ m: 1, width: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Professor</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {coursesProfessor.map(course => (
              <TableRow>
                <TableCell>{course.name}</TableCell>
                <TableCell>{course.professor.name}</TableCell>
                <TableCell>{course.startDate}</TableCell>
                <TableCell>{course.endDate}</TableCell>
                <TableCell>Edit | Delete</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {success && <SuccessrSnackBar message={t('createcourse.successMessage')} open={openSuccess} handleClose={handleCloseSuccess} />}
      {
        (Array.isArray(coursesProfessor) && coursesProfessor.length) || (Array.isArray(coursesStudent) && coursesStudent.length) ? (
          <div>
            <div>
              {Array.isArray(coursesProfessor) && coursesProfessor.map((course: CourseResponse) => (
                <CoursesList key={course.id} course={course}></CoursesList>
              ))}
            </div >

            <div>
              {Array.isArray(coursesStudent) && coursesStudent.map((course: CourseResponse) => (
                <CoursesStudent key={course.id} course={course}></CoursesStudent>
              ))}
            </div>
          </div>
        ) : loading ? (
          <Spinner size={150} />
        ) : (
          <Typography>{t("courses.emptyList")}</Typography>
        )
      }

      <ErrorSnackBar open={openError} handleClose={handleCloseError} errorType={errorType} />
    </>)
}

export default Courses