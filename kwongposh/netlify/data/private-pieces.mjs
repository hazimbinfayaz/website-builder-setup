// ---------------------------------------------------------------------------
// EDIT: THE PRIVATE COLLECTION
// These pieces are only sent to visitors who have entered a correct password.
// They never appear in the public page source.
//
// Each piece:
//   name   the title shown on the card                     (required)
//   place  where it was made                               (required)
//   price  optional, e.g. 'INR 2,40,000' or 'On request'
//   image  optional link to a photo. Leave it out to show "Photography soon".
//          Note: a photo link is visible to anyone who has it. For photos you
//          want fully private, host them somewhere that needs a login, or ask
//          for a protected-image endpoint to be added.
//
// To add a piece, copy one { ... }, block, paste it, and change the text.
// Mind the commas between blocks. Save, commit and push: the site updates.
// ---------------------------------------------------------------------------
export default [
  { name: 'Kani Pashmina shawl', place: 'Kanihama' },
  { name: 'Sozni jamawar shawl', place: 'Srinagar' },
  { name: 'Tilla pheran', place: 'Srinagar' },
];
