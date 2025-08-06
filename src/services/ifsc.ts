
async function getBankDetailsByIfsc(ifsc: string) {
    let bankDetails = await fetch(`https://ifsc.razorpay.com/${ifsc}`);
    bankDetails = await bankDetails.json();
    console.log(bankDetails);
    
    if(bankDetails) {
    return bankDetails;
    }else{
        return false;
    }
}

function isValidIFSC(ifsc:string) {
    const pattern = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    return pattern.test(ifsc);
  }

  
  export { getBankDetailsByIfsc, isValidIFSC };