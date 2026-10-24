import{j as e}from"./index-BhqEPHJP.js";const a=String.raw`static int send_all(int fd, const char *data, size_t length) {
    size_t sent = 0;
    while (sent < length) {
        ssize_t n = send(fd, data + sent, length - sent, 0);
        if (n < 0 && errno == EINTR) continue;
        if (n <= 0) {
            if (n == 0) errno = EPIPE;
            return -1;
        }
        sent += (size_t)n;
    }
    return 0;
}

static void fail(const char *operation) {
    perror(operation);
    exit(EXIT_FAILURE);
}`,l=String.raw`#include <arpa/inet.h>
#include <errno.h>
#include <signal.h>
#include <stdio.h>
#include <stdlib.h>
#include <sys/socket.h>
#include <unistd.h>

${a}

int main(void) {
    if (signal(SIGPIPE, SIG_IGN) == SIG_ERR) fail("signal");

    int listener = socket(AF_INET, SOCK_STREAM, 0);
    if (listener == -1) fail("socket");

    int reuse = 1;
    if (setsockopt(listener, SOL_SOCKET, SO_REUSEADDR,
                   &reuse, sizeof reuse) == -1) fail("setsockopt");

    struct sockaddr_in address = {0};
    address.sin_family = AF_INET;
    address.sin_port = htons(8080);
    address.sin_addr.s_addr = htonl(INADDR_LOOPBACK);

    if (bind(listener, (struct sockaddr *)&address,
             sizeof address) == -1) fail("bind");
    if (listen(listener, 5) == -1) fail("listen");

    puts("Listening on 127.0.0.1:8080 (one client)");
    fflush(stdout);

    int peer;
    do {
        peer = accept(listener, NULL, NULL);
    } while (peer == -1 && errno == EINTR);
    if (peer == -1) fail("accept");

    char buffer[1024];
    for (;;) {
        ssize_t n = recv(peer, buffer, sizeof buffer, 0);
        if (n < 0 && errno == EINTR) continue;
        if (n == -1) fail("recv");
        if (n == 0) break;  /* The client finished sending. */

        if (send_all(peer, buffer, (size_t)n) == -1) fail("send");
    }

    close(peer);
    close(listener);
    return EXIT_SUCCESS;
}`,o=String.raw`#include <arpa/inet.h>
#include <errno.h>
#include <signal.h>
#include <stdio.h>
#include <stdlib.h>
#include <sys/socket.h>
#include <unistd.h>

${a}

int main(void) {
    if (signal(SIGPIPE, SIG_IGN) == SIG_ERR) fail("signal");

    int fd = socket(AF_INET, SOCK_STREAM, 0);
    if (fd == -1) fail("socket");

    struct sockaddr_in server = {0};
    server.sin_family = AF_INET;
    server.sin_port = htons(8080);
    if (inet_pton(AF_INET, "127.0.0.1", &server.sin_addr) != 1) {
        fputs("Invalid IPv4 address\n", stderr);
        close(fd);
        return EXIT_FAILURE;
    }

    if (connect(fd, (struct sockaddr *)&server,
                sizeof server) == -1) fail("connect");

    const char message[] = "Hello from C sockets!\n";
    if (send_all(fd, message, sizeof message - 1) == -1) fail("send");

    /* Finish sending, but keep the receive half open. */
    if (shutdown(fd, SHUT_WR) == -1) fail("shutdown");

    fputs("Echo: ", stdout);
    char buffer[1024];
    for (;;) {
        ssize_t n = recv(fd, buffer, sizeof buffer, 0);
        if (n < 0 && errno == EINTR) continue;
        if (n == -1) fail("recv");
        if (n == 0) break;
        if (fwrite(buffer, 1, (size_t)n, stdout) != (size_t)n) {
            fail("fwrite");
        }
    }

    close(fd);
    return EXIT_SUCCESS;
}`,d=[["socket()","Create an endpoint and get its file descriptor. AF_INET selects IPv4; SOCK_STREAM selects a TCP byte stream here."],["bind()","Assign a local address and port to the server socket."],["listen()","Mark the socket as a listener and set the backlog for pending connections."],["accept()","Wait for a connection and return a new connected descriptor. The listening descriptor remains separate."],["connect()","Initiate the client connection to the server address and port."],["send() / recv()","Write and read bytes on a connected socket. Check how many bytes each call actually transfers."],["shutdown()","Close one direction of the connection, or both, while retaining the descriptor."],["close()","Release the descriptor when it is no longer needed."]],h=[["socket-basics","Socket basics"],["socket-calls","The main calls"],["tcp-server","TCP server"],["tcp-client","TCP client"],["compile-and-run","Compile and run"],["socket-details","Details to remember"]],m=[["https://man7.org/linux/man-pages/man7/socket.7.html","socket(7): the socket interface"],["https://man7.org/linux/man-pages/man7/tcp.7.html","tcp(7): TCP streams"],["https://man7.org/linux/man-pages/man2/accept.2.html","accept(2): accepting a connection"],["https://man7.org/linux/man-pages/man2/send.2.html","send(2): sending bytes and handling errors"],["https://man7.org/linux/man-pages/man2/recv.2.html","recv(2): receiving bytes and detecting EOF"],["https://man7.org/linux/man-pages/man3/inet_pton.3.html","inet_pton(3): converting IP addresses"]];function x(){return e.jsxs("article",{className:"blog-article w-full",children:[e.jsx("p",{className:"text-sm font-semibold uppercase tracking-[0.16em] text-gray-500",children:"Network basics / Sockets"}),e.jsx("h2",{className:"mt-3 text-3xl sm:text-4xl font-semibold text-gray-950",children:"Socket Programming in C"}),e.jsx("p",{className:"mt-4 text-lg leading-8 text-gray-600",children:"Build a small TCP echo server and client to see how two processes communicate. These examples use blocking IPv4 sockets on Linux or another POSIX system, such as macOS. On Windows, use a Linux environment through WSL to follow along."}),e.jsxs("nav",{"aria-label":"Socket guide contents",className:"blog-glass-quiet mt-6 rounded-lg p-4",children:[e.jsx("p",{className:"text-sm font-semibold text-gray-950",children:"In this guide"}),e.jsx("div",{className:"mt-3 flex flex-wrap gap-2",children:h.map(([t,n])=>e.jsx("a",{href:`#${t}`,className:"blog-glass-link rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-950",children:n},t))})]}),e.jsxs("div",{className:"mt-8 space-y-10",children:[e.jsxs(r,{id:"socket-basics",title:"1. What is a socket?",children:[e.jsx("p",{children:"A socket is an endpoint through which a process communicates. The operating system exposes it as an integer file descriptor. For an Internet socket, an IP address identifies a host interface and a port identifies a transport endpoint used by an application."}),e.jsxs("p",{children:["Here, both programs run on the same computer. The server listens on the loopback address ",e.jsx(s,{children:"127.0.0.1"}),", port"," ",e.jsx(s,{children:"8080"}),". The client connects to it using a local port chosen automatically by the operating system."]}),e.jsxs("div",{className:"grid gap-4 sm:grid-cols-2",children:[e.jsxs("div",{className:"blog-glass-inset rounded-lg p-4",children:[e.jsx("h4",{className:"font-semibold text-gray-950",children:"Server lifecycle"}),e.jsx("p",{className:"mt-2 break-words font-mono text-sm",children:"socket → bind → listen → accept → recv / send → close"})]}),e.jsxs("div",{className:"blog-glass-inset rounded-lg p-4",children:[e.jsx("h4",{className:"font-semibold text-gray-950",children:"Client lifecycle"}),e.jsx("p",{className:"mt-2 break-words font-mono text-sm",children:"socket → connect → send / recv → close"})]})]})]}),e.jsxs(r,{id:"socket-calls",title:"2. The main socket calls",children:[e.jsx("div",{className:"blog-table-shell overflow-hidden rounded-lg",children:e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full min-w-[480px] text-left text-sm",children:[e.jsx("caption",{className:"sr-only",children:"C socket calls and their roles"}),e.jsx("thead",{className:"border-b border-gray-500/10 bg-white/20 text-gray-950",children:e.jsxs("tr",{children:[e.jsx("th",{scope:"col",className:"px-4 py-3 font-semibold",children:"Call"}),e.jsx("th",{scope:"col",className:"px-4 py-3 font-semibold",children:"What it does"})]})}),e.jsx("tbody",{className:"divide-y divide-gray-500/10",children:d.map(([t,n])=>e.jsxs("tr",{children:[e.jsx("th",{scope:"row",className:"px-4 py-4 align-top font-mono font-medium text-gray-950",children:t}),e.jsx("td",{className:"px-4 py-4 align-top leading-7",children:n})]},t))})]})})}),e.jsxs("p",{children:[e.jsx(s,{children:"struct sockaddr_in"})," stores an IPv4 socket address."," ",e.jsx(s,{children:"htons()"})," converts the port to network byte order;"," ",e.jsx(s,{children:"htonl()"})," does the same for the loopback address constant. ",e.jsx(s,{children:"inet_pton()"})," converts a textual IP address directly into its binary network representation."]})]}),e.jsxs(r,{id:"tcp-server",title:"3. Create the echo server",children:[e.jsxs("p",{children:["Save this as ",e.jsx(s,{children:"server.c"}),". It accepts one client, echoes each received chunk, and exits after that client finishes sending. The ",e.jsx(s,{children:"send_all()"})," helper handles partial writes and interrupted calls. Binding to loopback keeps the example on your own computer."]}),e.jsx(i,{filename:"server.c",code:l}),e.jsxs("p",{children:[e.jsx(s,{children:"SO_REUSEADDR"})," helps with restarting the listener after a previous run; it does not allow a second active listener to take over the same address. ",e.jsx(s,{children:"accept()"})," returns the connected ",e.jsx(s,{children:"peer"})," socket, which is the one used for data transfer."]})]}),e.jsxs(r,{id:"tcp-client",title:"4. Create the client",children:[e.jsxs("p",{children:["Save this as ",e.jsx(s,{children:"client.c"}),". After sending its message, the client calls ",e.jsx(s,{children:"shutdown(fd, SHUT_WR)"})," to tell the server there are no more outgoing bytes. It can still receive the echo. Once the server has echoed everything and closes, the client reaches EOF."]}),e.jsx(i,{filename:"client.c",code:o})]}),e.jsxs(r,{id:"compile-and-run",title:"5. Compile and run",children:[e.jsx("p",{children:"Put both files in the same directory. You need a C compiler such as GCC or Clang; these POSIX socket functions are provided by the system C library."}),e.jsx(i,{filename:"Compile both programs",code:`cc -std=c11 -Wall -Wextra -Wpedantic -O2 server.c -o server
cc -std=c11 -Wall -Wextra -Wpedantic -O2 client.c -o client`}),e.jsx("p",{children:"In one terminal, start the server:"}),e.jsx(i,{filename:"Terminal 1",code:`$ ./server
Listening on 127.0.0.1:8080 (one client)`}),e.jsx("p",{children:"In another terminal, from the same directory, run the client:"}),e.jsx(i,{filename:"Terminal 2",code:`$ ./client
Echo: Hello from C sockets!`}),e.jsx("p",{children:"Both programs exit after the exchange. Restart the server before running the client again. If port 8080 is already in use, change the port in both files and recompile them."})]}),e.jsxs(r,{id:"socket-details",title:"6. Details to remember",children:[e.jsxs("ul",{className:"list-disc space-y-3 pl-5",children:[e.jsxs("li",{children:[e.jsx("strong",{children:"TCP is a byte stream."})," One ",e.jsx(s,{children:"send()"})," ","does not imply one matching ",e.jsx(s,{children:"recv()"}),". Read in a loop; real application protocols need message framing, such as a delimiter or length prefix."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Use the returned byte count."})," Received bytes are not automatically null-terminated C strings. The client uses"," ",e.jsx(s,{children:"fwrite()"})," with the exact count instead of printing the buffer with ",e.jsx(s,{children:"%s"}),"."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Check results."})," With the nonempty receive buffers used here,"," ",e.jsx(s,{children:"recv() == 0"})," means the peer finished sending. A result of ",e.jsx(s,{children:"-1"})," indicates an error; the examples retry ",e.jsx(s,{children:"EINTR"})," for send, receive, and accept."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Handle closed connections."})," Ignoring"," ",e.jsx(s,{children:"SIGPIPE"})," makes a failed write to a closed stream report an error rather than terminate the program through that signal. This choice applies to the whole process."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Blocking calls wait."})," The server waits in"," ",e.jsx(s,{children:"accept()"})," for a client, and"," ",e.jsx(s,{children:"recv()"})," waits for data or EOF. Handling many clients requires a broader design, such as nonblocking I/O with"," ",e.jsx(s,{children:"poll()"})," or worker threads."]})]}),e.jsxs("div",{className:"blog-glass-inset rounded-lg p-5",children:[e.jsx("h4",{className:"text-lg font-semibold text-gray-950",children:"What changes for UDP?"}),e.jsxs("p",{className:"mt-3",children:["Use ",e.jsx(s,{children:"SOCK_DGRAM"})," and typically"," ",e.jsx(s,{children:"sendto()"})," / ",e.jsx(s,{children:"recvfrom()"}),". There is no TCP connection setup, so no ",e.jsx(s,{children:"listen()"})," ","or ",e.jsx(s,{children:"accept()"}),". UDP preserves datagram boundaries but does not guarantee delivery or order. The EOF rule above is for TCP; a zero-length UDP datagram is valid data."]})]})]}),e.jsxs(r,{id:"socket-references",title:"References",children:[e.jsx("p",{children:"For the precise API behavior, see the Linux man-pages documentation:"}),e.jsx("ul",{className:"list-disc space-y-2 pl-5",children:m.map(([t,n])=>e.jsx("li",{children:e.jsx("a",{href:t,className:"font-medium text-gray-950 underline underline-offset-4",children:n})},t))})]})]})]})}function r({id:t,title:n,children:c}){return e.jsxs("section",{id:t,className:"scroll-mt-8",children:[e.jsx("h3",{className:"text-2xl font-semibold text-gray-950",children:n}),e.jsx("div",{className:"mt-4 space-y-4 leading-8 text-gray-700",children:c})]})}function i({filename:t,code:n}){return e.jsxs("figure",{className:"blog-code overflow-hidden rounded-lg",children:[e.jsx("figcaption",{className:"border-b border-gray-500/10 px-4 py-2 text-sm font-semibold text-gray-700",children:t}),e.jsx("pre",{"data-filename":t,className:"overflow-x-auto p-4 text-sm leading-7 text-gray-800",children:e.jsx("code",{children:n})})]})}function s({children:t}){return e.jsx("code",{className:"rounded bg-white/30 px-1.5 py-0.5 text-[0.9em] text-gray-900",children:t})}export{x as default};
