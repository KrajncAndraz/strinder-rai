import { useContext, useState } from 'react';
import { UserContext } from '../userContext';
import { Navigate } from 'react-router-dom';
import '../styles/Form.css';
import mqtt from 'mqtt';
import { MQTT_BROKER } from '../constants/mqtt_ip';
import { UAParser } from 'ua-parser-js';

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [use2FA, setUse2FA] = useState(false);
    const [error, setError] = useState("");
    const userContext = useContext(UserContext);

    async function Login(e) {
        e.preventDefault();
        const res = await fetch("http://localhost:3001/users/login", {
            method: "POST",
            credentials: "include",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username,
                password: password,
                use2FA: use2FA
            })
        });
        const data = await res.json();
        if (data._id !== undefined) {
            userContext.setUserContext(data);

            // --- MQTT publish ---
            const client = mqtt.connect(MQTT_BROKER);
            client.on('connect', () => {
            const parser = new UAParser();
            const uaResult = parser.getResult();
            const deviceData = {
                loginTime: new Date().toISOString(),
                device: {
                    brand: uaResult.device.vendor || 'Unknown',
                    modelName: uaResult.device.model || 'Unknown',
                    osName: uaResult.os.name || 'Unknown',
                    osVersion: uaResult.os.version || 'Unknown',
                    manufacturer: uaResult.device.vendor || 'Unknown',
                },
            };
            client.publish('statistics/login', JSON.stringify(deviceData), () => {
                client.end();
            });
        });
        } else {
            setUsername("");
            setPassword("");
            setError("Invalid username or password");
        }
    }

    return (
        <form onSubmit={Login}>
            {userContext.user ? <Navigate replace to="/" /> : ""}
            <input type="text" name="username" placeholder="Username"
                value={username} onChange={(e) => (setUsername(e.target.value))} />
            <input type="password" name="password" placeholder="Password"
                value={password} onChange={(e) => (setPassword(e.target.value))} />
            <label htmlFor="use2FA" class="container2FA">
                <input
                    type="checkbox"
                    id="use2FA"
                    checked={use2FA}
                    onChange={(e) => setUse2FA(e.target.checked)}
                />
                Use 2FA for this login
                <span class="checkmark"></span>
            </label>
            <input type="submit" name="submit" value="Log in" />
            <label style={{color: 'red'}}>{error}</label>
        </form>
    );
}

export default Login;