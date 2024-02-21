(impl-trait 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.nft-trait.nft-trait)
(define-non-fungible-token MISSIVE uint)
(define-data-var last-id uint u0)
(define-map missives
  {id: uint}
  {missive-hash: (string-ascii 64), author: principal}
)

(define-constant ERR_SET_MISSIVE (err u100))
(define-constant ERR_MINT (err u101))
(define-constant ERR_INVALID_HASH (err u102))
(define-constant ERR_UNABLE_TO_APPEND_LISTS (err u103))
(define-constant ERR_INDEXING (err 104))

;; owner to missives indexing
(define-map owner-to-missives principal (list 1000 uint))

(define-read-only (get-owner-to-missives)
  (map-get? owner-to-missives tx-sender)
)

(define-private (get-existing-list (new-missive-owned uint))
  (ok (let
    ((existingList (unwrap-panic (map-get? owner-to-missives tx-sender))))
    (unwrap! (as-max-len? (append existingList new-missive-owned) u1000) ERR_UNABLE_TO_APPEND_LISTS)
  ))
)

(define-private (set-owner-to-missives (new-missive-owned uint))
    (if (is-some (get-owner-to-missives)) 
      ;; needs to retrieve existing list of uint and append
      ;; #[allow(unchecked_data)]
      (ok (map-set owner-to-missives tx-sender (try! (get-existing-list new-missive-owned)))) 
      ;; #[allow(unchecked_data)]
      (ok (map-insert owner-to-missives tx-sender (list new-missive-owned)))
    )
)

(define-read-only (get-missive (id uint))
  (map-get? missives {id: id})
)

(define-private (set-missive (hash-string (string-ascii 64)))
  ;; Ensure the hash string is not empty
  (if (is-eq (len hash-string) u0)
    (err ERR_INVALID_HASH)
     ;; #[allow(unchecked_data)]
    (ok (map-set missives {id: (var-get last-id)} {missive-hash: hash-string , author: tx-sender})))
)

(define-public (evince (hash-string (string-ascii 64)))
  (begin 
    (unwrap! (mint tx-sender) ERR_MINT)
    ;; #[allow(unchecked_data)]
    (unwrap! (set-missive hash-string) ERR_SET_MISSIVE)
    (unwrap-panic (set-owner-to-missives (var-get last-id)))
    (ok true)
  )
)

(define-public (transfer (token-id uint) (sender principal) (recipient principal))
  (begin
     (asserts! (is-eq tx-sender sender) (err u403))
     ;; #[allow(unchecked_data)]
     (nft-transfer? MISSIVE token-id sender recipient)))

(define-public (transfer-memo (token-id uint) (sender principal) (recipient principal) (memo (buff 34)))
  (begin 
    (try! (transfer token-id sender recipient))
    (print memo)
    (ok true)))

(define-read-only (get-owner (token-id uint))
  (ok (nft-get-owner? MISSIVE token-id)))

(define-read-only (get-last-token-id)
  (ok (var-get last-id)))

(define-read-only (get-token-uri (token-id uint))
  (ok (some "https://token.stacks.co/{id}.json")))

(define-private (mint (new-owner principal))
    (let ((next-id (+ u1 (var-get last-id))))
      (var-set last-id next-id)
      (nft-mint? MISSIVE next-id new-owner)))

