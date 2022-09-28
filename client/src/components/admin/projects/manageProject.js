//lib
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { htmlDecode } from '../../../utils/tools';
import Moment from 'react-moment';

//comp
import { getProjectByTitle, getAllAssignee, getAllComponents } from '../../../store/actions/defects';
import { getAllUsersEmail, getAllProjects } from '../../../store/actions/admin';
import ModalComponent from '../../../utils/modal/modal';
import ReallocateUserPrompt from '../reallocate/reallocateUserPrompt';
import { defectListOfUserToBeRemoved, defectListOfComponentToBeRemoved, removeComponents, addComponents } from '../../../store/actions/projects';
import { resetState } from '../../../store/reducers/projects';
import { removeFromProject } from '../../../store/actions/admin';
import ReallocateComponentPrompt from '../reallocate/reallocateComponentPrompt';


//MUI
import { Divider, Typography } from '@mui/material'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import Tooltip from '@mui/material/Tooltip';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import GridViewIcon from '@mui/icons-material/GridView';
import Avatar from '@mui/material/Avatar';
import PersonIcon from '@mui/icons-material/Person';
import OutlinedInput from '@mui/material/OutlinedInput';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InputAdornment from '@mui/material/InputAdornment';
import FormHelperText from '@mui/material/FormHelperText';
import TextField from '@mui/material/TextField';
import AddIcon from '@mui/icons-material/Add';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';




const ManageProject = () => {

    //State
    //Nav tab
    const [tab, setTab] = useState(0);

    //redux
    const dispatch = useDispatch()
    const projects = useSelector(state => state.projects)
    //Defects that are assigned to the about to be removed user/component
    const defectListUser = useSelector(state => state.projects.defectListUserToBeRemoved)
    const defectListComponent = useSelector(state => state.projects.defectListComponentToBeRemoved)
    const defects = useSelector(state => state.defects);
    const users = useSelector(state => state.users)

    //Modal state
    const [openModal, setOpenModal] = useState(false);
    const [modalDescription, setModalDescription] = useState('');
    const [modalInput, setModalInput] = useState('');

    //state
    //project details
    const [projectTitle, setProjectTitle] = useState('')
    const [projectDescription, setProjectDescription] = useState('')


    //selected project
    const [selectProject, setSelectProject] = useState('')

    //editing state
    const [editingField, setEditingField] = useState('')
    const [confirmChanges, setConfirmChanges] = useState('')

    //state for remove user from project
    const [projectAssignee, setProjectAssignee] = useState([])
    const [removeProjectAssignee, setRemoveProjectAssignee] = useState('')
    const [openReallocatePromptUser, setOpenReallocatePromptUser] = useState(false);
    const [removeProjectAssigneeClicked, setRemoveProjectAssigneeClicked] = useState(false)

    //get list of users available for reassign
    const [projectAvailableAssignee, setProjectAvailableAssignee] = useState([])

    //state for remove component from project
    const [projectComponents, setProjectComponents] = useState([])
    const [removeProjectComponent, setRemoveProjectComponent] = useState('')
    const [openReallocatePromptComponent, setOpenReallocatePromptComponent] = useState(false);
    const [removeProjectComponentClicked, setRemoveProjectComponentClicked] = useState(false)

    // //list of components available to be reassign
    const [projectAvailableComponent, setProjectAvailableComponent] = useState([])

    //add component
    const [componentField, setComponentField] = useState('')
    const [componentAddError, setComponentAddError] = useState(false)
    const [componentErrorMessage, setComponentErrorMessage] = useState('')




    const defaultEditState = {
        editProjectTitle: false,
        editProjectDescription: false
    }
    const [editEnabled, setEditEnabled] = useState({
        defaultEditState
    })

    const handleModalInput = (event) => {
        setModalInput(event.target.value);
    }

    //handle add component

    const handleProjectComponentField = (event) => {
        setComponentField(event.target.value)
    }

    const handleAddComponent = () => {

        //check if the component to be added is not already in availableComponents

        if (componentField.trim() === "") {
            setComponentErrorMessage("Component name cannot be empty")
            setComponentAddError(true)
        } else if (projectAvailableComponent.includes(componentField)) {
            setComponentErrorMessage("Component cannot have same name")
            setComponentAddError(true)
        } else {
            //add the component
            dispatch(addComponents({
                title: selectProject,
                components: componentField
            }))
                .unwrap()
                .then(() => {
                    dispatch(getProjectByTitle({ projectTitle: selectProject }))
                })
            setComponentField('')
            setComponentErrorMessage('')
            setComponentAddError(false)
        }
    }

    const handleTrimOnBlur = (event) => {
        setComponentField(componentField.trim())

    }

    //Edit handle
    const handleEditState = (fieldName, enabled) => {
        //only set 1 to edit state at a time
        setEditEnabled({ [fieldName]: enabled })
    }

    const handleModalConfirm = async () => {

        switch (editingField) {
            case "removeAssigneeFromProject":
                const userEmail = removeProjectAssignee
                const projectTitle = selectProject
                dispatch(removeFromProject({
                    userEmail,
                    projectTitle
                }))
                    .unwrap()
                    .then(() => {
                        dispatch(getProjectByTitle({ projectTitle }))
                        //get the assignee again
                        dispatch(getAllAssignee(selectProject))
                    })
                break;
            case "removeComponentFromProject":
                const componentToBeRemove = removeProjectComponent
                const title = selectProject
                dispatch(removeComponents({ title, componentToBeRemove }))
                    .unwrap()
                    .then(() => {
                        dispatch(getProjectByTitle({ projectTitle: title }))
                    })
                break;
            default:
                break;
        }
        setModalInput('')
    }

    const handleEditConfirm = () => {

        // setOpenModal(true)
        switch (confirmChanges) {
            case "confirmProjectTitle":
                setModalDescription(`You are about to change Project Title \n\n From: "${projects.selectedProjectDetails.title}" 
                To: "+${projectTitle}"`)
                setEditingField(confirmChanges);
                break;
            default:
                break;
        }

        setConfirmChanges('')
    }


    const handleProjectTitle = (event) => {
        setProjectTitle(event.target.value)
    }


    const handleSelectProject = (event) => {
        setSelectProject(event.target.value)
        console.log(selectProject)

    }

    const handleProjectDescription = (event) => {
        setProjectDescription(event.target.value)
    }

    //Project handle
    const handleComponentsDelete = (component) => {
        setRemoveProjectComponentClicked(true)
        setRemoveProjectComponent(component)
        setEditingField('removeComponentFromProject')
    }

    //Project handle
    const handleAssigneeDelete = (assignee) => {
        setRemoveProjectAssigneeClicked(true)
        setRemoveProjectAssignee(assignee)
        setEditingField('removeAssigneeFromProject')
    }


    useEffect(() => {

        if (selectProject && removeProjectAssignee && removeProjectAssigneeClicked) {
            dispatch(defectListOfUserToBeRemoved({
                projectTitle: selectProject,
                userEmail: removeProjectAssignee
            }))
                .unwrap()
                .catch(() => {
                    setRemoveProjectAssigneeClicked(false)
                })
        }

        if (selectProject && removeProjectComponent && removeProjectComponentClicked) {
            dispatch(defectListOfComponentToBeRemoved({
                title: selectProject,
                componentToBeRemove: removeProjectComponent
            }))
                .unwrap()
                .catch(() => {
                    setRemoveProjectComponentClicked(false)
                })
        }

    }, [removeProjectAssigneeClicked, removeProjectComponentClicked])

    useEffect(() => {

        if (removeProjectAssigneeClicked) {

            if (defectListUser.length > 0) {
                setOpenReallocatePromptUser(true)
            } else {
                setOpenModal(true)
                setOpenReallocatePromptUser(false)
                setModalDescription(
                    <Box>
                        <Typography display={'inline'}>You are about to remove user: </Typography>
                        <Typography display={'inline'} color={"#0288d1"} fontWeight={'600'}>"{removeProjectAssignee}" </Typography>
                        <Typography display={'inline'}>from this project: </Typography>
                        <Typography display={'inline'} color={'darkblue'} fontWeight={'600'}>"{selectProject}"</Typography>
                    </Box>)
            }
        }

        if (removeProjectComponentClicked) {
            if (defectListComponent.length > 0) {
                setOpenReallocatePromptComponent(true)
            } else {
                setOpenModal(true)
                setOpenReallocatePromptComponent(false)
                setModalDescription(
                    <Box>
                        <Typography display={'inline'}>You are about to remove component: </Typography>
                        <Typography display={'inline'} color={"#9c27b0"} fontWeight={'600'}>"{removeProjectComponent}" </Typography>
                        <Typography display={'inline'}>from this project: </Typography>
                        <Typography display={'inline'} color={'darkblue'} fontWeight={'600'}>"{selectProject}"</Typography>
                    </Box>)
            }
        }

    }, [defectListUser, defectListComponent])


    //use effect for assignee and component reassigning
    //on user reallocate prompt close
    useEffect(() => {
        if (openReallocatePromptUser === false) {
            setRemoveProjectAssigneeClicked(false)
        }
        if (openReallocatePromptComponent === false) {
            setRemoveProjectComponentClicked(false)
        }
    }, [openReallocatePromptUser, openReallocatePromptComponent])

    //on modal state change
    useEffect(() => {
        handleEditConfirm()
        setRemoveProjectAssigneeClicked(false)
        setRemoveProjectComponentClicked(false)
    }, [openModal])

    useEffect(() => {

        if (selectProject) {
            dispatch(getAllAssignee(selectProject))
            dispatch(getAllComponents(selectProject))
        }
    }, [selectProject])

    useEffect(() => {
        if (defects.data.assignee) {
            setProjectAvailableAssignee([...defects.data.assignee])
        }
        if (defects.data.components) {
            setProjectAvailableComponent([...defects.data.components])
        }
    }, [defects])



    //trimming when click confirm
    useEffect(() => {
        switch (confirmChanges) {
            case "confirmProjectTitle":
                setProjectTitle(projectTitle.trim())
                setOpenModal(true)
                break;
            default:
                break;
        }
    }, [confirmChanges])


    //get project details when selected project
    useEffect(() => {
        if (selectProject !== "") {
            dispatch(getProjectByTitle({
                projectTitle: selectProject
            }))
        }
    }, [selectProject])

    //initial
    //set selectedProjectDetails to state
    useEffect(() => {
        if (projects.selectedProjectDetails) {
            setProjectTitle(projects.selectedProjectDetails.title)
            setProjectDescription(htmlDecode(projects.selectedProjectDetails.description))
            setProjectComponents(projects.selectedProjectDetails.components)
            setProjectAssignee(projects.selectedProjectDetails.assignee)
        }
    }, [projects.selectedProjectDetails])

    useEffect(() => {
        dispatch(resetState())
        dispatch(getAllUsersEmail({}))
        dispatch(getAllProjects({}))
    }, [])

    const handleSubmit = (event) => {
        event.preventDefault();
    }

    return (
        <Box className="manageProjectContainer" mt={5} sx={{ overflow: 'auto', maxHeight: '650px' }} >

            <form style={{ width: '100%', padding: '2rem', display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }} onSubmit={handleSubmit}>
                {!selectProject ?
                    <Typography variant='h6' flexBasis={'100%'} mb={3}>Select Project to begin</Typography>
                    :
                    null}


                <FormControl
                    id='project-select'
                    sx={{ m: 3, flexBasis: '45%' }}>
                    <InputLabel htmlFor='project-select'
                        sx={{ color: 'mediumblue' }}
                    >{selectProject === "" ? "Select Project" : "Selected Project"}</InputLabel>
                    <Select
                        id="project-select"
                        value={selectProject}
                        label={selectProject === "" ? "Select Project" : "Selected Project"}
                        onChange={handleSelectProject}

                    >
                        {projects.projectList.map((project, index) => (
                            <MenuItem key={`${project}-${index}`} value={project.title}>{project.title}</MenuItem>
                        ))}

                    </Select>
                </FormControl>

                <Box flexBasis={'100%'}></Box>


                {/* Tabs */}
                {selectProject  ?
                <Box sx={{ flexBasis: '100%', mt: 5, ml: 1 }} >

                    <List
                        id="managementInnerTab"
                        sx={{ display: 'inline-flex', flexDirection: 'row', justifyContent: 'flex-start', whiteSpace: 'nowrap' }}
                    >

                        <ListItem className='managementInnerTabItem'
                            sx={{ width: 'max-content' }}>
                            <ListItemButton
                                sx={{
                                    color: (tab === 0 ? '#a534eb' : 'black'),
                                    borderBottom: (tab === 0 ? '2px solid purple' : '')
                                }}
                                onClick={() => setTab(0)}
                            >
                                <ListItemText
                                    primary="Project Details"

                                />
                            </ListItemButton>
                        </ListItem>

                        <ListItem className='managementInnerTabItem'
                            sx={{ width: 'max-content' }}>
                            <ListItemButton
                                sx={{
                                    color: (tab === 1 ? '#a534eb' : 'black'),
                                    borderBottom: (tab === 1 ? '2px solid purple' : '')
                                }}
                                onClick={() => setTab(1)}
                            >
                                <ListItemText
                                    primary="Project Assignee"

                                />
                            </ListItemButton>
                        </ListItem>

                        <ListItem className='managementInnerTabItem'
                            sx={{ width: 'max-content' }}>
                            <ListItemButton
                                sx={{
                                    color: (tab === 2 ? '#a534eb' : 'black'),
                                    borderBottom: (tab === 2 ? '2px solid purple' : '')
                                }}
                                onClick={() => setTab(2)}
                            >
                                <ListItemText
                                    primary="Project Components"

                                />
                            </ListItemButton>
                        </ListItem>


                    </List>
                    <Divider></Divider>
                </Box>
                :
                null
                            }

                {/* project details */}
                {tab == 0 && projectTitle  ?
                <Box sx={{flexBasis:'100%',display:'flex',flexWrap:'wrap'}}>
                    <Typography className="adminHeader" variant='h5' sx={{ flexBasis: '100%', margin: '2rem' }}>Project Details:</Typography>
                    <FormControl
                        id='editProjectTitleForm'
                        sx={{ m: 3, width: '45%' }}>
                        <InputLabel htmlFor='projectTitle'
                            sx={{ color: '#9a239a' }}
                        >Project Title</InputLabel>
                        <OutlinedInput
                            required
                            name="projectTitle"
                            id="projectTitle"
                            text="text"
                            value={projectTitle}
                            label="Project Title"
                            onChange={handleProjectTitle}
                            fullWidth
                            disabled={!editEnabled.editProjectTitle}
                            inputProps={{ maxLength: 20 }}
                            endAdornment={users.data.permission[0].addProject ?
                                <InputAdornment position='end'>
                                    <Tooltip title="Confirm changes">
                                        <span>
                                            <IconButton
                                                aria-label="confirmProjectTitle"
                                                edge="end"
                                                onClick={(e) => {
                                                    setConfirmChanges("confirmProjectTitle")
                                                }}
                                                disabled={editEnabled.editProjectTitle && projects.selectedProjectDetails.title !== projectTitle.trim() ? false : true}
                                                sx={{ color: 'green' }}
                                            >
                                                {<CheckCircleIcon />}
                                            </IconButton>
                                        </span>
                                    </Tooltip>

                                    <Tooltip title="Edit field">
                                        <IconButton
                                            name="editProjectTitle"
                                            aria-label="edit-projectTitle"
                                            edge="end"
                                            onClick={(e) => handleEditState("editProjectTitle", true)}
                                            sx={{ color: 'blue' }}
                                        >
                                            {<EditIcon

                                            />}
                                        </IconButton>
                                    </Tooltip>

                                </InputAdornment>
                                :
                                null
                            }
                        />
                        <FormHelperText sx={{ textAlign: 'end' }}>Max Length: 20</FormHelperText>
                    </FormControl>
                
                    <FormControl
                        id='editProjectDescriptionForm'
                        sx={{ m: 3, width: '80%' }}>
                        <InputLabel htmlFor='projectDescription'
                            sx={{ color: '#9a239a' }}
                        >Project Description</InputLabel>
                        <OutlinedInput
                            // required
                            multiline={true}
                            minRows={4}
                            name="projectDescription"
                            id="projectDescription"
                            text="text"
                            value={projectDescription}
                            label="Project Description"
                            onChange={handleProjectDescription}
                            fullWidth
                            disabled={!editEnabled.editProjectDescription}
                            endAdornment={users.data.permission[0].addProject ?
                                <InputAdornment position='end'>
                                    <Tooltip title="Confirm changes">
                                        <span>
                                            <IconButton
                                                aria-label="confirmProjectDescription"
                                                edge="end"
                                                onClick={(e) => {
                                                    setConfirmChanges("confirmProjectDescription")
                                                }}
                                                disabled={editEnabled.editProjectDescription && projects.selectedProjectDetails.description !== projectDescription.trim() ? false : true}
                                                sx={{ color: 'green' }}
                                            >
                                                {<CheckCircleIcon />}
                                            </IconButton>
                                        </span>
                                    </Tooltip>

                                    <Tooltip title="Edit field">
                                        <IconButton
                                            name="editProjectDescription"
                                            aria-label="edit-projectDescription"
                                            edge="end"
                                            onClick={(e) => handleEditState("editProjectDescription", true)}
                                            sx={{ color: 'blue' }}
                                        >
                                            {<EditIcon

                                            />}
                                        </IconButton>
                                    </Tooltip>

                                </InputAdornment>
                                :
                                null
                            }
                        />
                    </FormControl>
                    </Box>
                    :
                    null
                }

{/* project assginee */}
                {tab === 1 ?
                    <Box>
                        <Typography className="adminHeader" variant='h5' sx={{ flexBasis: '100%', margin: '2rem' }}>Project Assignee:</Typography>
                        <List className='card' sx={{ m: 3, flexBasis: '100%', borderColor: '#0288d1'  }}>

                            <Typography ml={2} fontWeight={'600'} color={'#0288d1'}>{projectAssignee.length <= 1 ? "User assigned to this project " : "Users assigned to this project: "}</Typography>


                            <ListItem
                                sx={{ flexWrap: 'wrap' }}>
                                <ListItemAvatar
                                    className="BoxAvatarLayout"
                                >
                                    <Avatar>
                                        <PersonIcon />
                                    </Avatar>

                                </ListItemAvatar>

                                {projectAssignee ? projectAssignee.map((assignee, index) => (
                                    <Chip
                                        key={`${assignee + index}`}
                                        item={assignee}
                                        label={assignee}
                                        color="info"
                                        className='chip'
                                        variant='filled'
                                        deleteIcon={
                                            <Tooltip title="remove assignee">
                                                <RemoveCircleOutlineIcon />
                                            </Tooltip>
                                        }
                                        onDelete={() => handleAssigneeDelete(assignee)}
                                        sx={{ m: 1 }}
                                    />
                                ))
                                    :
                                    null}

                                    


                            </ListItem>
                        </List>
                    </Box>
                    :
                    null}

{/* project components */}
                {tab === 2 ?
                    <Box flexBasis={'100%'}>
                        <Typography className="adminHeader" variant='h5' sx={{ flexBasis: '100%', margin: '2rem' }}>Project Components:</Typography>

                        <List className='card' sx={{ m: 3, flexBasis: '100%', borderColor: '#9f2f9f' }}>
                            <Typography ml={2} fontWeight={'600'} color={'#9f2f9f'}>{projectComponents && projectComponents.length <= 1 ? "Project Component: " : "Project Components: "} </Typography>

                            <ListItem
                                sx={{ flexWrap: 'wrap' }}>
                                <ListItemAvatar
                                    className="BoxAvatarLayout"
                                >
                                    <Avatar>
                                        <PersonIcon />
                                    </Avatar>

                                </ListItemAvatar>

                                {projectComponents ? projectComponents.map((component, index) => (
                                    <Chip
                                        key={`${component + index}`}
                                        item={component}
                                        label={component}
                                        color="secondary"
                                        className='chip'
                                        variant='filled'
                                        deleteIcon={
                                            <Tooltip title="remove component">
                                                <RemoveCircleOutlineIcon />
                                            </Tooltip>
                                        }
                                        onDelete={() => handleComponentsDelete(component)}
                                        sx={{ m: 1 }}
                                    />
                                ))
                                    :
                                    null}


                            </ListItem>
                        </List>

                        <Box className="addComponentContainer" sx={{ display: 'flex', justifyContent: 'flex-start', flexWrap: 'wrap', mt: 3, ml: 1 }}>

                            <FormControl
                                id='addProjectComponentsForm'
                                sx={{ m: 2, flexBasis: '40%' }}
                                color="secondary"

                            >
                                <InputLabel htmlFor='projectComponents'
                                    sx={{ color: '#9a239a' , '&. MuiInputBase-input':{borderColor:'#9a239a'}}}
                                >Add New Components</InputLabel>
                                <OutlinedInput
                                    name="projectComponents"
                                    id="projectComponents"
                                    text="text"
                                    value={componentField}
                                    label="Project Components"
                                    onChange={handleProjectComponentField}
                                    onBlur={handleTrimOnBlur}
                                    error={componentAddError}
                                    inputProps={{maxLength: 20}}
                                    color="secondary"
                                    sx={{"&:hover .MuiOutlinedInput-notchedOutline": {
                                        borderColor:'#df35fc'
                                      }, "& .MuiOutlinedInput-notchedOutline":{
                                        borderColor:'#9c27b0'
                                      }}}
                                  
                                    endAdornment={
                                        <Button
                                            id="addComponentsBtn"
                                            variant="outlined"
                                            color="secondary"
                                            startIcon={<AddIcon sx={{ color: 'blueviolet' }} />}
                                            onClick={handleAddComponent}
                                        >
                                            Add
                                        </Button>
                                    }
                                />
                                <FormHelperText sx={{ textAlign: 'end' }}>Max Length: 20</FormHelperText>
                                <FormHelperText id="componentErrorMessage" error>{componentErrorMessage}</FormHelperText>
                            </FormControl>


                        </Box>
                    </Box>

                    :
                    null
                }



                <ModalComponent
                    open={openModal}
                    setOpenModal={setOpenModal}
                    title="Warning"
                    description={modalDescription}
                    warn={"Are you sure you want to continue"}
                    // input={true}
                    inputValue={modalInput}
                    // inputLabel={"Password"}
                    // inputType={"password"}
                    handleModalInput={handleModalInput}
                    handleModalConfirm={handleModalConfirm}
                    button1="Confirm"
                    button2="Cancel"
                    titleColor="darkred"
                >
                </ModalComponent>

                <ReallocateUserPrompt
                    open={openReallocatePromptUser}
                    setOpen={setOpenReallocatePromptUser}
                    user={removeProjectAssignee}
                    project={selectProject}
                    projectAvailableAssignee={projectAvailableAssignee}
                    defectListUser={defectListUser}
                >
                </ReallocateUserPrompt>

                <ReallocateComponentPrompt
                    open={openReallocatePromptComponent}
                    setOpen={setOpenReallocatePromptComponent}
                    component={removeProjectComponent}
                    project={selectProject}
                    projectAvailableComponent={projectAvailableComponent}
                    defectListComponent={defectListComponent}
                >

                </ReallocateComponentPrompt>

            </form>
        </Box>

    )
}

export default ManageProject