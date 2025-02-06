use aiken/transaction.{
  Publish, ScriptContext, 
}
use aiken/transaction/certificate
use aiken/transaction/credential.{Inline, Pointer, ScriptCredential, VerificationKeyCredential}
use aiken/cbor
use aiken/bytearray

validator {
  pub fn two(red: ByteArray, ctx: ScriptContext) {
    let ScriptContext { transaction : _transaction, purpose } = ctx
    when purpose is {
      Publish(inner) -> {
        trace bytearray.to_hex(cbor.serialise(inner))
        expect Inline(ScriptCredential(_own_hash)) =
          when inner is {
            certificate.CredentialRegistration(delegator) -> {
              trace @"XXXX"
              delegator
            }
            certificate.CredentialDeregistration(delegator) -> { 
              trace @"YYYYY"
              delegator
            }
            certificate.CredentialDelegation { delegator, .. } -> {
              trace @"ZZZZ"
              expect when delegator is {
                Inline(VerificationKeyCredential(hash)) -> {
                  trace bytearray.to_hex(hash)
                  fail @"ooops 0"
                }
                Inline(ScriptCredential(hash)) -> {
                  trace bytearray.to_hex(hash)
                  fail @"ooops 1"
                }
                Pointer(_,_,_) -> {
                  trace @"Pointer"
                  trace bytearray.to_hex( cbor.serialise (delegator ))
                  fail @"Other"
                }
              }
              delegator
            } 
            _ -> {
              fail @"Bad cred"
              }
          }
        red == "oops"
      }
      _ -> fail @"Bad purpose"
    }
  }
}
