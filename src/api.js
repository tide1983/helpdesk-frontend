const BASE_URL = 'https://helpdesk-backend-kappa.vercel.app';

function request(method, url, body = null) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, `${BASE_URL}${url}`);

    if (body) {
      xhr.setRequestHeader('Content-Type', 'application/json');
    }

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        if (xhr.status === 204) {
          resolve(null);
          return;
        }
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch (e) {
          reject(e);
        }
      } else {
        reject(new Error(`HTTP ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Network error')));
    xhr.addEventListener('abort', () => reject(new Error('Aborted')));

    xhr.send(body ? JSON.stringify(body) : null);
  });
}

export const api = {
  getAllTickets: () => request('GET', '?method=allTickets'),
  getTicketById: (id) => request('GET', `?method=ticketById&id=${id}`),
  createTicket: (data) => request('POST', '?method=createTicket', data),
  updateTicket: (id, data) => request('POST', `?method=updateById&id=${id}`, data),
  deleteTicket: (id) => request('GET', `?method=deleteById&id=${id}`),
};