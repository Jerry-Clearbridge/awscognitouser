const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
const AWS = require('aws-sdk');
const dotenv = require('dotenv');
dotenv.config()

const USER_POOL_ID = process.env.USER_POOL_ID
const CLIENT_ID = process.env.CLIENT_ID

const poolData = {    
	UserPoolId : USER_POOL_ID,   
	ClientId : CLIENT_ID 
}; 

const pool_region = process.env.POOL_REGION;

const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({  
	apiVersion: "2016-04-19",
	region: pool_region,
	accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY
  });

const create = async (req, res) => {
	const {email, password} = req.body;
	console.log(email, password);
	if (email && password) {
		const attributeList = [];
	
		userPool.signUp(email, password, attributeList, null, function(err, result){
			if (err) {
				console.log('error from sign up ==>>>' , err);
				return res.status(400).send({message: err.message});
			}

			const confirmParams = {
				UserPoolId: USER_POOL_ID, 
				Username: email
			};
			
			cognitoidentityserviceprovider.adminConfirmSignUp(confirmParams, function(err, data) {
				if (err) {
					console.log('confirm admin error ==>> ', err, err.stack); 
					return res.status(400).send({message: err.message});
				}
				
				const cognitoUser = result.user;
				console.log('user name is ' + cognitoUser.getUsername());
				return res.status(200).send({message: 'ok', data: cognitoUser})
			  });
		});

	} else {
		return res.status(400).send({message: 'user name and password not provided'});
	}
	
}

const login = async (req, res) => {
	const {email, password} = req.body;
	if (email && password) {
		const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
			Username : email,
			Password : password,
		});
		const userData = {
			Username : email,
			Pool : userPool
		};
		const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
		cognitoUser.authenticateUser(authenticationDetails, {
			onSuccess: function (result) {
				// console.log('access token + ' + result.getAccessToken().getJwtToken());
				// console.log('id token + ' + result.getIdToken().getJwtToken());
				// console.log('refresh token + ' + result.getRefreshToken().getToken());
				const accessToken = result.getAccessToken().getJwtToken()
				const idToken = result.getIdToken().getJwtToken()
				const refreshToken = result.getRefreshToken().getToken()
				const tokens = {accessToken, idToken, refreshToken}
				return res.status(200).send({message: 'ok', data: tokens})
			},
			onFailure: function(err) {
				console.log(err);
				return res.status(400).send({message: err.message});
			},

		});
	} else {
		return res.status(400).send({message: 'user name and password not provided'});
	}
}

const verifyEmail = async (req, res) => {
	const {email} = req.body;
	if (email) {
		const confirmParams = {
			UserPoolId: USER_POOL_ID, 
			Username: email 
		};
		
		cognitoidentityserviceprovider.adminConfirmSignUp(confirmParams, function(err, data) {
			if (err) {
				console.log('confirm admin error ==>> ', err, err.stack); 
				return res.status(400).send({message: err.message});
			}
	
			console.log('conform admin ==>> ', data);
			return res.status(200).send({message: 'Email confirmed'})
		})
	} else {
		return res.status(400).send({message: 'email not provided'});
	}
	
}

const sleep = (numberMillis) => {
	let nowTime = new Date()
	const exitTime = nowTime.getTime() + numberMillis
	while (true) {
		nowTime = new Date()
		if (nowTime.getTime() > exitTime) return
	}
 }

const createMultitudeUsers = async (req, res) => {

	for (let i = 41; i < 1000; i++ ) {
		const email = `ali.almahmud+${i}@clearbridgemobile.com`
		const password = "Test123$"

		const attributeList = [];
	
		userPool.signUp(email, password, attributeList, null, function(err, result){
			if (err) {
				console.log('error from sign up ==>>>' , err);
				return res.status(400).send({message: err.message});
			}

			const confirmParams = {
				UserPoolId: USER_POOL_ID, 
				Username: email
			};
			
			cognitoidentityserviceprovider.adminConfirmSignUp(confirmParams, function(err, data) {
				if (err) {
					console.log('confirm admin error ==>> ', err, err.stack); 
					return res.status(400).send({message: err.message});
				}
				
				// const cognitoUser = result.user;
				console.log(`user create ${i}`);
				
			  });
		});
		sleep(1000)

	}

	// return res.status(200).send({message: 'ok'})
}

module.exports = {create, login, verifyEmail, createMultitudeUsers}