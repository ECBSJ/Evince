(impl-trait 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.nft-trait.nft-trait)
;; mainnet nft-trait address
;; (impl-trait 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait.nft-trait)
;; testnet nft-trait address
;; (impl-trait 'ST1NXBK3K5YYMD6FD41MVNP3JS1GABZ8TRVX023PT.nft-trait.nft-trait)

(define-non-fungible-token MISSIVE uint)
(define-data-var last-id uint u0)
(define-map missives
  {id: uint}
  {missive-hash: (string-ascii 64), ipfs-cid: (string-ascii 64), author: principal}
)

(define-constant ERR_SET_MISSIVE (err u100))
(define-constant ERR_MINT (err u101))
(define-constant ERR_INVALID_HASH (err u102))
(define-constant ERR_UNABLE_TO_APPEND_LISTS (err u103))
(define-constant ERR_INDEXING (err u104))
(define-constant ERR_INVALID_INPUTS (err u105))
(define-constant ERR_INVALID_TX_SENDER (err u106))

;; author to missives indexing
(define-map author-to-missives principal (list 1000 uint))

(define-read-only (get-author-to-missives)
  (map-get? author-to-missives tx-sender)
)

(define-private (get-existing-list (new-missive-owned uint))
  (ok (let
    ((existingList (unwrap-panic (map-get? author-to-missives tx-sender))))
    (unwrap! (as-max-len? (append existingList new-missive-owned) u1000) ERR_UNABLE_TO_APPEND_LISTS)
  ))
)

(define-private (set-author-to-missives (new-missive-owned uint))
    (if (is-some (get-author-to-missives)) 
      ;; needs to retrieve existing list of uint and append
      ;; #[allow(unchecked_data)]
      (ok (map-set author-to-missives tx-sender (try! (get-existing-list new-missive-owned)))) 
      ;; #[allow(unchecked_data)]
      (ok (map-insert author-to-missives tx-sender (list new-missive-owned)))
    )
)

(define-read-only (get-missive (id uint))
  (map-get? missives {id: id})
)

(define-private (set-missive (hash-string (string-ascii 64)) (ipfs-cid (string-ascii 64)))
  ;; Ensure the hash string is not empty
  (if (is-eq (len hash-string) u0)
    (err ERR_INVALID_HASH)
     ;; #[allow(unchecked_data)]
    (ok (map-set missives {id: (var-get last-id)} {missive-hash: hash-string , ipfs-cid: ipfs-cid, author: tx-sender})))
)

(define-private (evince (hash-string (string-ascii 64)) (ipfs-cid (string-ascii 64)))
  (begin 
    (unwrap! (mint tx-sender) ERR_MINT)
    ;; #[allow(unchecked_data)]
    (unwrap! (set-missive hash-string ipfs-cid) ERR_SET_MISSIVE)
    (unwrap-panic (set-author-to-missives (var-get last-id)))
    (print { id: (var-get last-id), missive-hash: hash-string, ipfs-cid: ipfs-cid, author: tx-sender })
    (ok true)
  )
)

(define-public (prevince (hash-string (string-ascii 64)) (ipfs-cid (string-ascii 64)))
  (if
    (or
      (is-eq (len hash-string) u0)
      (is-eq (len ipfs-cid) u0)
    )

    ERR_INVALID_INPUTS
    (evince hash-string ipfs-cid)
  )
)

(define-public (transfer (token-id uint) (sender principal) (recipient principal))
  (begin
     (asserts! (is-eq tx-sender sender) ERR_INVALID_TX_SENDER)
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
  (let ((cid-string (get ipfs-cid (unwrap-panic (get-missive token-id)))))
    (ok (some (concat "https://" (concat cid-string ".ipfs.dweb.link/"))))
  )
)

(define-private (mint (new-author principal))
    (let ((next-id (+ u1 (var-get last-id))))
      (var-set last-id next-id)
      (nft-mint? MISSIVE next-id new-author)))

