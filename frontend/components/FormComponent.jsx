import React, {useState} from 'react';

function FormElement({label, name, type, value, onChange, error}){
    return(
        <div style={{marginBottom: '1rem'}}>
            <label>
                {label}
                <input type={type} name={name} value={value} onChange={onChange} style={{marginLeft: '0.5rem'}}/>
            </label>
            {error && <div style={{color: 'red', fontSize: '0.8rem'}}> {error}</div>}
        </div>
    )
}