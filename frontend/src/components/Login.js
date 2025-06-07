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
    const [error, setError] = useState("");
    const [waitingForApproval, setWaitingForApproval] = useState(false);
    const userContext = useContext(UserContext);

    async function LoginHandler(e) {
        e.preventDefault();
        setError("");
        setWaitingForApproval(false);

        const use2FA = true; // 2FA je vedno vklopljen!

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
            setWaitingForApproval(true);
            let confirmed = false;
            let attempts = 0;
            while (!confirmed && attempts < 60) { // max 2 minuti
                await new Promise(r => setTimeout(r, 2000));
                const res = await fetch("http://localhost:3001/users/check-login-confirmed", {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username })
                });
                const checkData = await res.json();
                if (checkData.confirmed) {
                    confirmed = true;
                    break;
                }
                attempts++;
            }
            setWaitingForApproval(false);
            if (!confirmed) {
                setError("Login ni bil potrjen na telefonu.");
                return;
            }
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

    if (userContext.user) {
        return <Navigate replace to="/" />;
    }

    return (
        <form onSubmit={LoginHandler}>
            <input type="text" name="username" placeholder="Username"
                value={username} onChange={(e) => (setUsername(e.target.value))} />
            <input type="password" name="password" placeholder="Password"
                value={password} onChange={(e) => (setPassword(e.target.value))} />
            <input type="submit" name="submit" value="Log in" disabled={waitingForApproval} />
            <label style={{color: 'red'}}>{error}</label>
            {waitingForApproval && (
                <div style={{ color: 'blue', marginTop: 10 }}>
                    Waiting for approval on your device...
                </div>
            )}
        </form>
    );
}

export default Login;