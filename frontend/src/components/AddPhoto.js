import { useContext, useState } from 'react'
import { Navigate } from 'react-router';
import { UserContext } from '../userContext';

function AddPhoto(props) {
    const userContext = useContext(UserContext); 
    const[name, setName] = useState('');
    const[file, setFile] = useState('');
    const[uploaded, setUploaded] = useState(false);

    async function onSubmit(e){
        e.preventDefault();

        if(!name){
            alert("Enter name!");
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('image', file);
        const res = await fetch('http://localhost:3001/photos', {
            method: 'POST',
            credentials: 'include',
            body: formData
        });
        const data = await res.json();

        setUploaded(true);
    }

    return (
        <form onSubmit={onSubmit}>
            {!userContext.user ? <Navigate replace to="/login" /> : ""}
            {uploaded ? <Navigate replace to="/" /> : ""}
            <input type="text" name="ime" placeholder="Image Name" value={name} onChange={(e)=>{setName(e.target.value)}}/>
            <label>Choose image</label>
            <input type="file" id="file" onChange={(e)=>{setFile(e.target.files[0])}}/>
            <input type="submit" name="submit" value="Upload" />
        </form>
    )
}

export default AddPhoto;