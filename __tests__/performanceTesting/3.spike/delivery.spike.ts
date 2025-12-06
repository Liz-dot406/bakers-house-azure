import http  from  "k6/http"
import { check, sleep } from "k6"

export const options = {
    stages :[
        { duration: "10m", target: 100 },
        { duration: "1hr", target: 200 },
        { duration: "5m", target: 100},  
    ]     
}

export default () => {
    const res = http.get("http://localhost:5000/api/deliveries")
    check(res, {
        "is status 200": (r) => r.status === 200,
    })
    sleep(1)
}