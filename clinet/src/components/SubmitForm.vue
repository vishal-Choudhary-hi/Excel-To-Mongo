<template>
    <div v-if="isPending" class="box">
        <p class="selected">{{file.name}}</p>
        <div class="isPending">In process ...</div>
    </div>
    <div v-else>
        <form v-if="!status" @submit.prevent="handleSubmit" class="box">
            <p v-if="!file">Select a .xlsx or a .xls file</p>
            <p v-if="file" class="selected">{{file.name}}</p>
            <label for="myFile" class="uploadLabel"></label>
            <input type="file" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet , application/vnd.ms-excel" name="myFile" id="myFile"  @change="handleChange" class="disappear">
            <button v-if="file">Submit</button>
        </form>
        <div v-else if="done" class="box">
            <p>{{done}}</p>
            <p class="clickMe" @click="handleClick">Click here to upload a file again</p>
        </div>
    </div>
</template>

<script>
import { ref } from '@vue/reactivity'
import axios from "axios";
export default {
    setup(){
        const status=ref(null)
        const done=ref(null)
        const file=ref(null)
        const isPending=ref(false) 
        const handleClick=()=>{
            status.value=null
            done.value=null
            file.value=null
        }
        const handleChange =(e)=>{
            const selected=e.target.files[0]
            if(selected){
                file.value=selected
                const formData = new FormData();
                formData.append("file", file.value);
                axios
                    .post("http://localhost:4500/upload", formData)
                    .then(res => {
                        console.log(res)
                    })
                    .catch(err => {
                        console.log(err)
                    });
            }else{
                file.value=null
            }
        }
        const handleSubmit=()=>{
            isPending.value=true;
            const formData = new FormData();
            formData.append("file", file.value);
            axios
                .post("http://localhost:4500/submit", formData)
                .then(res => {
                    if(res.status==200){
                        isPending.value=false
                        status.value="notPending"
                        done.value="File Successfully updated"
                    }
                })
                .catch(err => {
                    console.log(err)
                    isPending.value=false
                    status.value="notPending"
                    done.value="File got some errror"
                });
        }
        return {file,handleClick,handleChange,handleSubmit,done,status,isPending};
    }
    
}
</script>

<style>
    p{
        font-weight: bolder;
        font-size: 19px;   
    }
    .box{
        width: 75%;
        margin:auto;
        margin-top:100px;
        display: flex;
        flex-direction: column;
        padding:auto;
        height: 200px;
        border:2px dashed black;
        justify-content: space-around;
        align-items: center;
    }
    .error{
        color:red;
        text-align: center;
    }
    .disappear{
        display:none;
    }
    .uploadLabel{
        height: 50px;
        width: 50px;
        border-radius: 50%;
        background-image: url(data:image/png;base64,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);
        background-origin: center;
        background-position: center;
        background-size: cover;
        background-color: rgb(128 224 98);
        cursor: pointer;
        box-shadow: rgb(30 237 61 / 82%) 0px 6px 24px 0px, rgb(30 237 61 / 82%) 0px 0px 0px 1px;
    }
    .selected{
        color: rgb(128 224 98);
    }
    .clickMe{
        text-decoration: underline;
        color: rgb(149, 205, 97);
        cursor: pointer;
    }
    .isPending{
            width: 160px;
            height: 28px;
            text-align: center;
            border-radius: 10px;
            font-weight: bold;
            background-color: rgba(239, 239, 239, 0.215);
    }
    button{
        font-size: 17px;
        margin-top: 10px;
        border: 0;
        background-color: rgb(128 224 98);
        font-weight: bold;
        border-radius: 30px;
        box-shadow: rgb(30 237 61 / 82%) 0px 6px 24px 0px, rgb(30 237 61 / 82%) 0px 0px 0px 1px;
    }
</style>