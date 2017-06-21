import React, { Component } from 'react';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import PropTypes from 'prop-types';
import TextField from 'material-ui/TextField';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import UserPreferencesStore from '../../stores/UserPreferencesStore';

class Settings extends Component {

	constructor(props) {
		super(props);
		let defaults = UserPreferencesStore.getPreferences();
		let defaultServer = defaults.Server;
		let defaultTheme = defaults.Theme;
		this.state = {
			theme: defaultTheme,
			server: defaultServer,
			serverUrl: '',
            serverFieldError: false,
            checked: false,
			validForm: true
		};

		this.customServerMessage = '';
	}

	handleSubmit = () => {
		let newTheme = this.state.theme;
		let newServer = this.state.server;
		if(newServer.slice(-1)==='/'){
			newServer = newServer.slice(0,-1);
		}
		let vals = {
			theme: newTheme,
			server: newServer
		}
		this.props.onSettingsSubmit(vals);
	}

	handleSelectChange= (event, index, value) => {
		this.setState({theme:value});
	}

	handleChange = (event) => {
        let state = this.state;
        let serverUrl;
        if (event.target.value === 'customServer') {
        	state.checked = true;
        	state.serverFieldError = true;
        }
		else if (event.target.value === 'standardServer') {
			state.checked = false;
			state.serverFieldError = false;
			let defaults = UserPreferencesStore.getPreferences();
			let standardServerURL = defaults.StandardServer;
			state.server = standardServerURL;
		}
		else if (event.target.name === 'serverUrl'){
        	serverUrl = event.target.value;
        	let validServerUrl =
/(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:~+#-]*[\w@?^=%&amp;~+#-])?/i
        	.test(serverUrl);
			state.server = serverUrl;
			state.serverFieldError = !(serverUrl && validServerUrl);
        }

        if (state.serverFieldError) {
        	this.customServerMessage = 'Enter a valid URL';
        }
        else{
        	this.customServerMessage = '';
        }

    	if (!state.serverFieldError || !state.checked)
    	{
    		state.validForm = true;
    	}
        else {
        	state.validForm = false;
        }
		this.setState(state);
	};

	render() {

		const styles = {
			'textAlign': 'center',
			'padding': '10px'
		}

		const radioButtonStyles = {
		  block: {
		    maxWidth: 250,
		  },
		  radioButton: {
		    marginBottom: 16,
		  },
		};

		const serverURL = <TextField name="serverUrl"
							onChange={this.handleChange}
							errorText={this.customServerMessage}
							floatingLabelText="Custom URL" />;
		const hidden = this.state.checked ? serverURL : '';

		return (
			<div className="loginForm">
				<Paper zDepth={0} style={styles}>
					<h1>Settings</h1>
					<div>
						<h4>Theme:</h4>
						<DropDownMenu
							label='Default Theme'
							value={this.state.theme}
							onChange={this.handleSelectChange}>
				          <MenuItem value={'light'} primaryText="Light" />
				          <MenuItem value={'dark'} primaryText="Dark" />
				        </DropDownMenu>
			        </div>
					<div>
						<h4>Server:</h4>
						<RadioButtonGroup style={{display: 'flex',
						  marginTop: '10px',
						  maxWidth:'200px',
						  flexWrap: 'wrap',
						  margin: 'auto'}}
						 name="server" onChange={this.handleChange}
						 defaultSelected="standardServer">
						<RadioButton
						       value="customServer"
						       label="Custom Server"
						       labelPosition="left"
						       style={radioButtonStyles.radioButton}
						     />
						<RadioButton
						       value="standardServer"
						       label="Standard Server"
						       labelPosition="left"
						       style={radioButtonStyles.radioButton}
						     />
						</RadioButtonGroup>
					</div>
					<div>
						{hidden}
					</div>
					<div>
						<RaisedButton
							label="Save"
							disabled={!this.state.validForm}
							backgroundColor={
								UserPreferencesStore.getTheme()==='light'
								? '#607D8B' : '#19314B'}
							labelColor="#fff"
							onClick={this.handleSubmit}
						/>
					</div>
				</Paper>
			</div>);
	}
}

Settings.propTypes = {
	history: PropTypes.object,
	onSettingsSubmit: PropTypes.func
};

export default Settings;
