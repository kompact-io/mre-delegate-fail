use aiken/transaction.{
  Publish, ScriptContext, 
}
use aiken/transaction/certificate
use aiken/transaction/credential.{Inline, Pointer, ScriptCredential, VerificationKeyCredential}
use aiken/cbor
use aiken/bytearray

validator {
  pub fn two(red: ByteArray, ctx: ScriptContext) {
    trace @"two"
    let ScriptContext { transaction : _transaction, purpose } = ctx
    when purpose is {
      Publish(inner) -> {
        trace @"Publish"
        trace bytearray.to_hex(cbor.serialise(inner))
        expect Inline(ScriptCredential(_own_hash)) =
          when inner is {
            certificate.CredentialRegistration(delegator) -> {
              trace @"reg"
              delegator
            }
            certificate.CredentialDeregistration(delegator) -> { 
              trace @"dereg"
              delegator
            }
            certificate.CredentialDelegation { delegator, .. } -> {
              trace @"deleg"
              let unused = when delegator is {
                Inline(VerificationKeyCredential(hash)) -> {
                  trace bytearray.to_hex(hash)
                  fail @"ooops 0"
                }
                Inline(ScriptCredential(hash)) -> {
                  trace bytearray.to_hex(hash)
                  True
                }
                Pointer(_,_,_) -> {
                  trace @"Pointer"
                  trace bytearray.to_hex( cbor.serialise (delegator ))
                  fail @"Other"
                }
              }
              expect unused == True
              delegator
            } 
            _ -> {
              fail @"Bad cred"
              }
          }
        trace bytearray.to_hex(red)
        red == "oops"
      }
      _ -> fail @"Bad purpose"
    }
  }
}
