import DetailToGalleryButton from "@/features/navigation/DetailToGalleryButton";

export default function page() {
  return (
    <>
      <section
        aria-describedby="page-title"
        className="w-full pointer-events-auto"
      >
        <div className="absolute inset-0 grid grid-cols-[1fr_2fr] gap-8 p-4 md:p-8">
          <div className="fixed pointer-events-none inset-0 grid gap-4 content-center p-4 md:p-8 w-1/3">
            <div className="flex items-center gap-2">
              <span>#01</span>
              <span className="w-px h-[1.5em] rotate-12 bg-gray-700 block"></span>
              <span>personal work</span>
            </div>
            <div>
              <h1 id="page-title" className="text-4xl">
                福沢コウ Portfolio
              </h1>
              <span>2025-8-1 ~ 2025/10/1</span>
            </div>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolor
              voluptatum molestiae aut optio. Quasi sint excepturi ab minima
              consectetur magni, maxime a quae pariatur? Eum id iure possimus
              animi ad!
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                className="border p-2 cursor-pointer pointer-events-auto"
                data-cursor-hover
              >
                visit site
              </button>
              <button
                className="border p-2 cursor-pointer pointer-events-auto"
                data-cursor-hover
              >
                view github
              </button>
            </div>
          </div>
          <div id="detail-canvas" className="relative min-h-full col-2">
            <div className="pt-8 pb-24">
              <div className="aspect-8/5"></div>
              <article>
                <p>
                  Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ipsa
                  cupiditate corrupti eum, vero iure vitae aliquid quod neque at
                  est molestiae accusamus hic magni minus perspiciatis sapiente
                  explicabo. Porro, voluptatibus? Lorem ipsum dolor sit amet,
                  consectetur adipisicing elit. Sed, ex! Est nihil dolores qui
                  doloribus culpa tempora sit dolor, non, voluptates atque
                  labore aperiam animi? Accusantium in voluptates dolores sed.
                  Aut excepturi ipsam est, vel magnam blanditiis delectus
                  dolorem corrupti cupiditate ad amet porro debitis illo rerum
                  incidunt numquam voluptatibus, adipisci sequi. Suscipit
                  numquam asperiores ipsa molestiae nam dignissimos aperiam!
                  Magnam nobis nemo asperiores nam mollitia, cumque ad
                  repudiandae quod excepturi fugit ut eligendi, quis quaerat
                  quos tempora totam labore temporibus laudantium dolorem
                  blanditiis soluta? Dicta in repellat iure laborum! Quidem rem
                  ipsum earum molestias, dicta soluta illo libero porro officia,
                  delectus voluptatum dignissimos, nihil blanditiis deleniti vel
                  fugit saepe. Repudiandae rerum maiores eaque delectus
                  quibusdam aliquid asperiores enim quam? Aut doloremque vel
                  omnis debitis nesciunt! Quisquam perspiciatis nihil maiores
                  modi ut dolorum suscipit fugiat quos alias dicta? Iusto omnis
                  minima a neque nihil incidunt perferendis natus vero
                  repudiandae est? Recusandae aperiam impedit voluptatem
                  ducimus, aut accusamus est earum omnis sit repudiandae, ipsum
                  eligendi quos praesentium eius tempore, quisquam iure vel
                  facere ex soluta. Maiores voluptatibus voluptatum autem
                  doloremque esse! Omnis debitis iure commodi enim quam autem
                  corrupti! Totam odio veniam magnam ducimus, perferendis
                  quaerat exercitationem ipsam facere qui dolores suscipit neque
                  tenetur harum tempora autem, iste accusantium assumenda sequi?
                  Nesciunt laboriosam numquam itaque temporibus omnis. Nihil
                  odio quo ipsa unde eum nam at magnam, sunt, dignissimos
                  voluptas neque veniam, recusandae doloremque. Perferendis,
                  ratione explicabo voluptate ad saepe cum distinctio!
                  Veritatis, illum? Facere, autem consequuntur velit temporibus
                  minima quisquam sed obcaecati vero? Voluptatibus quisquam
                  praesentium reprehenderit quas illo, rerum debitis illum ad
                  eius delectus quam optio laudantium natus magnam modi! Qui
                  quis vero quae voluptatum iure dolorum. Dolor tempora
                  assumenda facere alias esse voluptatum consectetur error
                  expedita a, placeat, neque hic laboriosam tempore aliquid
                  sequi iste aliquam ipsa autem cumque!
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>
      <DetailToGalleryButton />
    </>
  );
}
