
import React, { Component } from 'react';
class About extends Component{
    render() {
        return (<div>
            <p>This is a simple demonstration app.  It is used to
            demonstrate displaying multiple SensorThings services.
            </p>
            <p>

                The following services are currently used
                <ul>
                    <li>http://st.newmexicowaterdata.org/FROST-Server/v1.1</li>
                    <li>https://nm.ngwmn.internetofwater.dev/api/v1.1</li>
                </ul>

            </p>
        </div>)
    }
}
export default About