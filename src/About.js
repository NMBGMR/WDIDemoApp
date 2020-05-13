
import React, { Component } from 'react';
class About extends Component{
    render() {
        console.log('asdfasdsdf')
        return (<div>
            <p>This is a simple demonstration app.  It is used to
            demonstrate displaying multiple SensorThings services.
            </p>
            <p>

                The following services are currently used
                <ul>
                    <li>http://34.106.252.186/FROST-Server/v1.1</li>
                    <li>https://frost-nm.internetofwater.dev/api/v1.0</li>
                </ul>

            </p>
        </div>)
    }
}
export default About