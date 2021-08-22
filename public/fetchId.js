const uid = document.querySelector('#uid');

async function fetchId() {
  const getid = await fetch(`${location.href}api/uid`);
  const response = await getid.json();
  const id = response.id ?? '';
  uid.value = id;
}
fetchId();
