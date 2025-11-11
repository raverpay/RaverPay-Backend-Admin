Ikeja Electricity Distribution Company (IKEDC) Payment API Integration
This section contains the recommended flow for integrating Ikeja Electric Bills Payment services on the VTpass RESTful API.

This API allows payment to both prepaid and postpaid IKEDC meters.

The VTpass IKEDC payment API allows you to vend token for IKEDC Prepaid meters and also pay electricity bills for IKEDC Postpaid meters using the meter number / Account ID.

For Prepaid meters, a token is generated. This token will be loaded on the customer’s meter by the customer.

Please display token to customer after a successful transaction, also send token by email and SMS to customer.

Ikeja Electric covers the following areas in Lagos State: Abule Egba, Akowonjo, Ikeja, Ikorodu, Oshodi, Shomolu.

Authentication
Learn about authentication from here.

Available Endpoints
To integrate the VTpass Ikeja Electricity (IKEDC) Bills Payment RESTful API, the endpoints below applies:

Verify Meter Number
Purchase Product (prepaid and postpaid payments available)
Query transaction status
Always ensure you validate the customer’s meter number.

ServiceID: ikeja-electric

VERIFY METER NUMBER
Using a POST method, you can verify a meter number with the following endpoint:

Live: https://vtpass.com/api/merchant-verify

Sandbox: https://sandbox.vtpass.com/api/merchant-verify

On Sandbox, please use the following meter numbers (sandbox) to test:

For prepaid: 1111111111111

For Postpaid: 1010101010101

To simulate a failed meter number validation, please use any number apart from the one provided above as meter number.

FIELDS M/O TYPE DESCRIPTION
billersCode M Number The meter number you wish to make the bills payment on.
On Sandbox
For prepaid: 1111111111111

For Postpaid: 1010101010101

serviceID M String Service ID as specified by VTpass. In this case, it is ikeja-electric
type M String This is basically the type of meter you are trying to validate. It can be either prepaid or postpaid

EXPECTED RESPONSE

{
"code": "000",
"content": {
"Customer_Name": "TESTMETER1",
"Address": "ABULE EGBA BU ABULE",
"Meter_Number": "68100017372",
"Customer_Arrears": "",
"Minimum_Amount": "",
"Min_Purchase_Amount": "",
"Can_Vend": "yes",
"Business_Unit": "",
"Customer_Account_Type": "PRIME",
"Meter_Type": "PREPAID",
"WrongBillersCode": false,
"commission_details": {
"amount": null,
"rate": "1.50",
"rate_type": "percent",
"computation_type": "default"
}
}
}

PURCHASE PRODUCT (Payment)
You can make a purchase for either a prepaid or postpaid meter.

Notes
Kindly note that VTpass commission rates differ for all types of meters and customer account types. Check our commission rates here.

The meter types “Meter_Type” are prepaid and postpaid, while account types “Customer_Account_Type” are MD and NMD

MD = Maximum Demand ( this is usually for bigger consumptions)

NMD = Non Maximum Demand meter( household meters and smaller consumptions)

In order to get the customer account type, refer to the verfication section of this page.

Kindly contact your account manager for more information on this topic.

Prepaid Meter Payment
Using a POST method, prepaid Token can be vended for Ikeja Electric prepaid meters with the endpoint below:

Live: https://vtpass.com/api/pay

Sandbox: https://sandbox.vtpass.com/api/pay

ServiceID: ikeja-electric

The sandbox environment provides specific scenarios to simulate success, failure, or unexpected outcomes for prepaid and postpaid meter purchases. Use the examples below to test and observe how your integration behaves.

Refer to the table below to find the correct billersCode for simulating various API responses:

BillersCode Event Description
1111111111111 Successful – Prepaid Returns a successful response for testing prepaid meter purchases.
1010101010101 Successful – Postpaid Returns a successful response for testing postpaid meter purchases.
201000000000 Pending Simulates an unexpected pending response.
500000000000 Unexpected Response Simulates an expected response, used to test how your system handles anomalies.
400000000000 No Response Simulates a scenario where the API returns no response.
300000000000 Timeout Simulates a timeout scenario for testing response handling under delays.
Any random meter number other than the above Failed Simulates a failed scenario for testing error handling for transaction failure.

NEEDED PAYLOAD

FIELDS Mandatory/Optional TYPE DESCRIPTION
request_id M String This is a unique reference with which you can use to identify and query the status of a given transaction after the transaction has been executed.
Click here to understand how to generate a valid request ID

serviceID M String Service ID as specified by VTpass. In this case, it is ikeja-electric
billersCode M String The meter number you wish to make the bills payment on
variation_code M String This is the meter type. In this case prepaid
amount M Number The amount (Naira) of electricity you want to purchase.
phone M Number The phone number of the customer or recipient of this service

EXPECTED RESPONSE

{
"code": "000",
"content": {
"transactions": {
"status": "delivered",
"product_name": "Ikeja Electric Payment - IKEDC",
"unique_element": "1111111111111",
"unit_price": "2000",
"quantity": 1,
"service_verification": null,
"channel": "api",
"commission": 30,
"total_amount": 1970,
"discount": null,
"type": "Electricity Bill",
"email": "sandbox@sandbox.vtpass.com",
"phone": "123450987623",
"name": null,
"convinience_fee": 0,
"amount": "2000",
"platform": "api",
"method": "api",
"transactionId": "17416102247366731230557150",
"commission_details": {
"amount": 30,
"rate": "1.50",
"rate_type": "percent",
"computation_type": "default"
}
}
},
"response_description": "TRANSACTION SUCCESSFUL",
"requestId": "2025031013366434255",
"amount": 2000,
"transaction_date": "2025-03-10T12:37:04.000000Z",
"purchased_code": "Token : 26362054405982757802",
"customerName": "N/A",
"customerAddress": "N/A",
"meterNumber": "N/A",
"token": "Token : 26362054405982757802",
"tokenAmount": 1860.47,
"exchangeReference": "40532461",
"resetToken": "N/A",
"configureToken": "N/A",
"units": "79.9 kWh",
"fixChargeAmount": 0,
"tariff": "R2 SINGLE PHASE RESIDENTIAL",
"taxAmount": 0,
"debtAmount": 0,
"kct1": "N/A",
"kct2": "N/A",
"penalty": 0,
"costOfUnit": 0,
"announcement": "N/A",
"meterCost": 0,
"currentCharge": 0,
"lossOfRevenue": 0,
"tariffBaseRate": 0,
"installationFee": 0,
"reconnectionFee": 0,
"meterServiceCharge": 0,
"administrativeCharge": 0
}

Postpaid Meter Payment
Using a POST method, electricity bills can be paid for Ikeja Electric postpaid meters with the endpoint below:

Live: https://vtpass.com/api/pay

Sandbox: https://sandbox.vtpass.com/api/pay

ServiceID: ikeja-electric

On Sandbox, please use the following meter number to test:

For postpaid: 1010101010101

To simulate a failed postpaid meter payment, please use any number apart from the one provided above as meter number.

FIELDS Mandatory/Optional TYPE DESCRIPTION
request_id M String This is the reference with which you can use to query the status of a given transaction after the transaction has been executed.
Click here to understand how to generate a valid request ID

serviceID M String Service ID as specified by VTpass. In this case, it is ikeja-electric
billersCode M String The meter number you wish to make the bills payment on
variation_code M String This is the meter type. In this case postpaid

amount M Number The amount (Naira) of electricity you want to purchase
phone M Number The phone number of the customer or recipient of this service

EXPECTED RESPONSE

{
"code": "000",
"content": {
"transactions": {
"status": "delivered",
"product_name": "Ikeja Electric Payment - IKEDC",
"unique_element": "1010101010101",
"unit_price": "2000",
"quantity": 1,
"service_verification": null,
"channel": "api",
"commission": 30,
"total_amount": 1970,
"discount": null,
"type": "Electricity Bill",
"email": "sandbox@sandbox.vtpass.com",
"phone": "123450987623",
"name": null,
"convinience_fee": 0,
"amount": "2000",
"platform": "api",
"method": "api",
"transactionId": "17416078554133602707537164",
"commission_details": {
"amount": 30,
"rate": "1.50",
"rate_type": "percent",
"computation_type": "default"
}
}
},
"response_description": "TRANSACTION SUCCESSFUL",
"requestId": "2025031012574292285",
"amount": 2000,
"transaction_date": "2025-03-10T11:57:35.000000Z",
"purchased_code": "",
"customerName": "NP NGEMA",
"customerAddress": "6 ABIODUN ODESEYE Shomolu BU",
"meterNumber": null,
"utilityName": "Eskom",
"exchangeReference": "0971120581015673",
"balance": null
}

QUERY TRANSACTION STATUS
Using a POST method, transaction status can be queried with the endpoint below:

LIVE: https://vtpass.com/api/requery

Sandbox: https://sandbox.vtpass.com/api/requery

FIELDS Mandatory/Optional TYPE DESCRIPTION
request_id M String This is the reference with which you sent when purchasing a transaction after the transaction has been executed.

EXPECTED RESPONSE

For Successful Prepaid Meter Payment
{
"response_description": "TRANSACTION SUCCESSFUL",
"code": "000",
"content": {
"transactions": {
"status": "delivered",
"product_name": "Ikeja Electric Payment - IKEDC",
"unique_element": "1111111111111",
"unit_price": 2000,
"quantity": 1,
"service_verification": null,
"channel": "api",
"commission": 30,
"total_amount": 1970,
"discount": null,
"type": "Electricity Bill",
"email": "sandbox@sandbox.vtpass.com",
"phone": "123450987623",
"name": null,
"extras": "Token : 26362054405982757802",
"convinience_fee": 0,
"amount": 2000,
"platform": "api",
"method": "wallet",
"transactionId": "17416034528553907930106528",
"product_id": 14,
"commission_details": {
"amount": 30,
"rate": "1.50",
"rate_type": "percent",
"computation_type": "default"
}
}
},
"requestId": "2025031011443091397",
"amount": 2000,
"transaction_date": "2025-03-10T10:44:12.000000Z",
"purchased_code": "Token : 26362054405982757802",
"customerName": "N/A",
"customerAddress": "N/A",
"meterNumber": "N/A",
"token": "Token : 26362054405982757802",
"tokenAmount": 1860.47,
"exchangeReference": "40532461",
"resetToken": "N/A",
"configureToken": "N/A",
"units": "79.9 kWh",
"fixChargeAmount": 0,
"tariff": "R2 SINGLE PHASE RESIDENTIAL",
"taxAmount": 0,
"debtAmount": 0,
"kct1": "N/A",
"kct2": "N/A",
"penalty": 0,
"costOfUnit": 0,
"announcement": "N/A",
"meterCost": 0,
"currentCharge": 0,
"lossOfRevenue": 0,
"tariffBaseRate": 0,
"installationFee": 0,
"reconnectionFee": 0,
"meterServiceCharge": 0,
"administrativeCharge": 0
}
For Successful Postpaid Meter Payment
{
"response_description": "TRANSACTION SUCCESSFUL",
"code": "000",
"content": {
"transactions": {
"status": "delivered",
"product_name": "Ikeja Electric Payment - IKEDC",
"unique_element": "1010101010101",
"unit_price": 2000,
"quantity": 1,
"service_verification": null,
"channel": "api",
"commission": 30,
"total_amount": 1970,
"discount": null,
"type": "Electricity Bill",
"email": "sandbox@sandbox.vtpass.com",
"phone": "123450987623",
"name": null,
"extras": null,
"convinience_fee": 0,
"amount": 2000,
"platform": "api",
"method": "wallet",
"transactionId": "17416036339772775385163300",
"product_id": 14,
"commission_details": {
"amount": 30,
"rate": "1.50",
"rate_type": "percent",
"computation_type": "default"
}
}
},
"requestId": "2025031011472332571",
"amount": 2000,
"transaction_date": "2025-03-10T10:47:13.000000Z",
"purchased_code": "",
"customerName": "NP NGEMA",
"customerAddress": "6 ABIODUN ODESEYE Shomolu BU",
"meterNumber": null,
"utilityName": "Eskom",
"exchangeReference": "0971120581015673",
"balance": null
}

OTHERS SERVICES

ServiceID: eko-electric
ServiceID: kano-electric
ServiceID: portharcourt-electric
ServiceID: jos-electric
ServiceID: ibadan-electric
ServiceID: kaduna-electric
ServiceID: abuja-electric
ServiceID: enugu-electric
ServiceID: benin-electric
ServiceID: aba-electric
ServiceID: yola-electric
