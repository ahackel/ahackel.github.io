from PIL import Image, ImageFilter
import os, re

MAX_IMAGE_SIZE = [1920, 1920]
MAX_THUMB_SIZE = [640, 320]
THUMB_FILE = "thumb.jpg"
IMAGE_TYPES = [".jpg", ".png"]
DIRS_TO_SCAN = ["_projects"]
ORIGINALS_DIR = r"/.org"
INDEX_FILE = "index.md"
FORCE_RECREATE_IMAGES = False


def getImagesInDir(path):
	images = []
	files = os.listdir(path)
	for file in files:
		extension = os.path.splitext(file)[1].lower()
		if extension in IMAGE_TYPES:
			images.append(file)
	return images


def processDir(path):
	if os.path.exists(path + "/org"):
		os.rename(path + "/org", path + ORIGINALS_DIR)
	originals_path = path + ORIGINALS_DIR

	# Create org path and move images there:
	if not os.path.exists(originals_path):
		os.mkdir(originals_path)
		images = getImagesInDir(path)
		for image in images:
			os.rename(path + "/" + image, originals_path + "/" + image)

	meta = "images:\n"

	images = getImagesInDir(originals_path)
	for image in images:
		imagePath = path + "/" + image
		if not os.path.exists(imagePath) or FORCE_RECREATE_IMAGES:
			print("Processing image: " + imagePath)
			im = Image.open(originals_path + "/" + image)
			if image == THUMB_FILE:
				im.thumbnail(MAX_THUMB_SIZE)
			else:
				im.thumbnail(MAX_IMAGE_SIZE)
			im.save(imagePath)
		else:
			im = Image.open(imagePath)

		meta += '  {0}: {{ width: {1[0]}, height: {1[1]} }}\n'.format(image, im.size)

	# load content of index file:
	if os.path.exists(path + "/" + INDEX_FILE):
		metaFile = open(path + "/" + INDEX_FILE, "r")
		content = metaFile.read()
		metaFile.close()
	else:
		content = ""

	# split front matter and other content:
	reg = re.match( r'^\s*---(.*)---\s*$', content, re.MULTILINE|re.DOTALL)
	if not reg == None:
		frontMatter = reg.group()
		otherContent = content[reg.end():]

		# find images part
		reg = re.search( r'^\s*images:\n(^\s+.+?\n)*', frontMatter, re.MULTILINE)
		#reg = re.search( r'^\s*images:.*?(?=(---))', frontMatter, re.MULTILINE|re.DOTALL)
		if not reg == None:
			frontMatter = frontMatter.replace(reg.group(), meta)
		else:
			frontMatter = frontMatter[:-3] + meta + "---"

		content = frontMatter + otherContent
	else:
		# No frontMatter found, create it from scratch:
		content = '---\n{}---\n{}'.format(meta, content)

	metaFile = open(path + "/" + INDEX_FILE, "w")
	metaFile.write(content)
	metaFile.close()

files = os.listdir(DIRS_TO_SCAN[0])
for dir in files:
	if os.path.isdir(DIRS_TO_SCAN[0] + "/" + dir):
		processDir(DIRS_TO_SCAN[0] + "/" + dir)

#Read image
#im = Image.open( 'img/andreashackel.png' )
#Display image
#im.show()
