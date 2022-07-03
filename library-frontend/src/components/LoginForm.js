import { useMutation } from '@apollo/client'
import React from 'react'
import { useState } from 'react'
import { LOGIN, ME } from '../queries'

const LoginForm = (props) => {
    const [username, setUsername] = useState()
    const [password, setPassword] = useState()
    const [login] = useMutation(LOGIN, { refetchQueries: [{ query: ME }] })

    const onSubmit = async (e) => {
        e.preventDefault()
        const result = await login({ variables: { username, password } })
        props.setToken(result.data.login.value)
        localStorage.setItem('token', result.data.login.value)
    }

    if (!props.show) return null
    
    return (
        <form onSubmit={onSubmit}>
            <div>
                username:<input onChange={e => setUsername(e.target.value)}></input>
            </div>
            <div>
                password: <input onChange={e => setPassword(e.target.value)}></input>
            </div>
            <div>
                <button type='submit'>login</button>
            </div>
        </form>
    )
}

export default LoginForm